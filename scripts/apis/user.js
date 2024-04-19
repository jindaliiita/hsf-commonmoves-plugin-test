/*
 * API for interacting with the User system.
 */

const urlParams = new URLSearchParams(window.location.search);
export const DOMAIN = urlParams.get('env') === 'stage' ? 'ignite-staging.bhhs.com' : 'www.bhhs.com';
const API_URL = '/bin/bhhs';

/**
 * Confirms if user is logged in or not
 * @return {boolean}
 */
export function isLoggedIn() {
  // Check if we have userDetails in session storage
  const userDetails = sessionStorage.getItem('userDetails');
  if (!userDetails) {
    return false;
  }

  // Check for .rwapiauth cookie
  const cookies = document.cookie.split(';');
  const rwapiauthCookie = cookies.find((c) => c.trim().startsWith('.rwapiauth'));
  if (rwapiauthCookie) {
    return true;
  }

  return false;
}

/**
 * Get user details if they are logged in, otherwise return null.
 * @returns {object} user details
 */
export function getUserDetails() {
  const userDetails = sessionStorage.getItem('userDetails');
  if (!userDetails) {
    return {
      profile: {},
    };
  }
  return JSON.parse(userDetails);
}

async function fetchUserProfile(username) {
  const time = new Date().getTime();
  const profileResponse = await fetch(`${API_URL}/cregUserProfile?Email=${encodeURIComponent(username)}&_=${time}`);
  const json = profileResponse.json();
  return json;
}

const profileListeners = [];

/**
 * Register a callback handler that is fired any time a profile is modified
 * by either login, logout, updateProfile, or saveProfile
 *
 * @param {Function} listener
 */
export function onProfileUpdate(listener) {
  profileListeners.push(listener);
}

/** Make changes to the user profile in session (does not save to the servlet)
 * This also triggers any listeners that are registered for profile updates
 *
 * @param {Object} Updated user profile
*/
export function updateProfile(profile) {
  const userDetails = getUserDetails();

  // Update profile in session storage using a merge
  const existingProfile = userDetails.profile;
  userDetails.profile = { ...existingProfile, ...profile };
  sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
  profileListeners.forEach((listener) => {
    listener(userDetails.profile);
  });
}

/**
 * Attempt to update the user profile.  If successful, also update session copy.
 * Caller must look at response to see if it was successful, etc.
 * @param {Object} Updated user profile
 * @returns response object with status, null if user not logged in
 */
export async function saveProfile(profile) {
  const userDetails = getUserDetails();
  if (userDetails === null) {
    return null;
  }
  const existingProfile = userDetails.profile;

  // Update profile in backend, post object as name/value pairs
  const url = `${API_URL}/cregUserProfile`;
  const postBody = {
    FirstName: profile.firstName,
    LastName: profile.lastName,
    MobilePhone: profile.mobilePhone || '',
    HomePhone: profile.homePhone || '',
    Email: profile.email,
    EmailNotifications: profile.emailNotifications || existingProfile.emailNotifications || false,
    ContactKey: existingProfile.contactKey,
    signInScheme: profile.signInScheme || existingProfile.signInScheme || 'default',
    HomeAddress1: profile.homeAddress1 || '',
    HomeAddress2: profile.homeAddress2 || '',
    HomeCity: profile.homeCity || '',
    HomeStateOrProvince: profile.homeStateOrProvince || '',
    HomePostalCode: profile.homePostalCode || '',
    Language: profile.language,
    Currency: profile.currency,
    UnitOfMeasure: profile.measure,
  };
  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: new URLSearchParams(postBody).toString(),
  });

  if (response.ok) {
    // Update profile in session
    updateProfile(profile);
  }

  return response;
}

/**
 * Request a password reset email.
 * @returns response object with status, null if user not logged in
 */
export async function requestPasswordReset() {
  const userDetails = getUserDetails();
  if (userDetails === null) {
    return null;
  }

  const url = `${API_URL}/cregForgotPasswordtServlet`;
  const postBody = {
    Email: userDetails.username,
  };
  const response = fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    credentials: 'include',
    mode: 'cors',
    body: new URLSearchParams(postBody).toString(),
  });

  return response;
}

/**
 * Logs the user out silently.
 */
export function logout() {
  // Remove session storage
  sessionStorage.removeItem('userDetails');

  // Remove cookies
  const cookies = document.cookie.split(';');
  cookies.forEach((c) => {
    const cookie = c.trim();
    if (cookie.startsWith('.rwapiauth')) {
      document.cookie = `${cookie}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  profileListeners.forEach((listener) => {
    listener({});
  });
}

/**
 * Authenticates the user based on the username and password.
 *
 * @param {object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.password
 * @param {function<Response>} failureCallback Callback provided reponse object.
 * @return {Promise<Object>} User details if login is successful.
 */
export async function login(credentials, failureCallback = null) {
  const url = `${API_URL}/cregLoginServlet`;
  let error;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams({
        Username: credentials.username,
        Password: credentials.password,
      }).toString(),
    });
    if (resp.ok) {
      // Extract contactKey and externalID from response JSON.  Store in session
      const responseJson = await resp.json();
      const { contactKey } = responseJson;
      // const { hsfconsumerid } = JSON.parse(externalID);

      const profile = await fetchUserProfile(credentials.username);

      const sessionData = {
        contactKey,
        // externalID,
        // hsfconsumerid,
        profile,
        username: credentials.username,
      };
      sessionStorage.setItem('userDetails', JSON.stringify(sessionData));
      profileListeners.forEach((listener) => {
        listener(profile);
      });
      return sessionData;
    }
    error = resp;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.message);
    error = e.message;
  }
  logout();
  if (failureCallback) {
    await failureCallback(error);
  }
  return null;
}
