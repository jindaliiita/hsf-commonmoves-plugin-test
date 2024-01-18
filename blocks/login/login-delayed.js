import { close, displayError, reset } from './login.js';
import { login, isLoggedIn, getUserDetails } from '../../scripts/apis/user.js';

const block = document.querySelector('.login.block');

function isValid(form) {
  const errors = [];
  const user = form.querySelector('input[name="username"]');
  if (!user.value || user.value.trim().length === 0) {
    errors.push('Email address is required.');
    block.querySelector('input[name="username"]').classList.add('error');
  }

  const password = form.querySelector('input[name="password"]');
  if (!password.value || password.value.trim().length === 0) {
    block.querySelector('input[name="password"]').classList.add('error');
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    displayError(errors);
    return false;
  }
  return true;
}

function loginError(response) {
  if (response.status === 401) {
    displayError(['Invalid username or password.']);
  } else {
    displayError([`There was an error logging in (${response.body})`]);
  }
}

/**
 * Checks if the user is logged in and updates the header accordingly.
 */
function checkForLoggedInUser() {
  if (isLoggedIn()) {
    const userDetailsLink = document.body.querySelector('.nav-profile .username a');
    document.body.querySelector('.nav-profile .login').style.display = 'none';
    document.body.querySelector('.nav-profile .username').style.display = 'block';
    const userDetails = getUserDetails();
    userDetailsLink.textContent = userDetails?.profile?.firstName || 'Valued Customer';
  }
}

/**
 * Submits the form.
 *
 * @param {HTMLFormElement} form
 */
async function submit(form) {
  reset();

  if (isValid(form)) {
    const credentials = {
      username: form.querySelector('input[name="username"]').value,
      password: form.querySelector('input[name="password"]').value,
    };
    const userDetails = await login(credentials, loginError);
    if (userDetails) {
      close();
      checkForLoggedInUser();
    }
  }
}

[...block.querySelectorAll('input[name="username"], input[name="password"]')].forEach((el) => {
  el.addEventListener('blur', (e) => {
    const { value } = e.currentTarget;
    if (!value || value.trim().length === 0) {
      e.currentTarget.classList.add('error');
    } else {
      e.currentTarget.classList.remove('error');
    }
  });
});

const rememberMe = block.querySelector('.help .remember input[type="checkbox"]');
const pseudoRemember = block.querySelector('.remember .checkbox');
const warning = block.querySelector('.help .warning');

pseudoRemember.addEventListener('click', () => {
  rememberMe.click();
});

rememberMe.addEventListener('change', () => {
  pseudoRemember.classList.toggle('checked');
  warning.classList.toggle('visible');
});

block.querySelector('a.forgot-password').addEventListener('click', (e) => {
  e.currentTarget.closest('.login-form').classList.remove('open');
  const event = new Event('open-overlay');
  event.overlay = 'forgot-password'; // TODO: Change this to a constant exported from block.
  document.body.dispatchEvent(event);
});

block.querySelector('.create-account .create-button').addEventListener('click', (e) => {
  e.currentTarget.closest('.login-form').classList.remove('open');
  const event = new Event('open-overlay');
  event.overlay = 'create-account'; // TODO: Change this to a constant exported from block.
  document.body.dispatchEvent(event);
});

block.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
});

block.querySelector('.cta a.submit').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  submit(block.querySelector('form'));
});

block.querySelector('.cta a.cancel').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  close();
});

checkForLoggedInUser();
