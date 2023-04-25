/* Wrapper for Suggestion API */

const urlParams = new URLSearchParams(window.location.search);
export const DOMAIN = urlParams.get('env') === 'stage' ? 'ignite-staging.bhhs.com' : 'www.bhhs.com';
const API_URL = `https://${DOMAIN}/bin/bhhs`;

let suggestionFetchController;

/**
 * Get suggestions for users based on their input and optional country.
 *
 * @param {String} type the type of search to perform
 * @param {String} office the id of office for the site performing the search.
 * @param {String} keyword the partial for suggestion search
 *
 * @return {Promise<Object>|undefined} Promise with results or undefined if fetch was aborted.
 */
export async function getSuggestions(type, office, keyword) {
  suggestionFetchController?.abort();
  suggestionFetchController = new AbortController();
  const { signal } = suggestionFetchController;

  const endpoint = `${API_URL}/suggesterServlet?search_type=${type}&keyword=${keyword}&office_id=${office}&_=${Date.now()}`;
  return fetch(endpoint, { signal })
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      // eslint-disable-next-line no-console
      console.log('Unable to fetch suggestions');
      return [];
    }).catch((err) => {
      if (err.name === 'AbortError') {
        // User abort, do nothing;
        return undefined;
      }
      throw err;
    });
}

export function abortSuggestions() {
  suggestionFetchController?.abort();
}
