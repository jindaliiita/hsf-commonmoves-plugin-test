import { DOMAIN } from './agent.js';
import Filter from './Filter.js';

const API_URL = `https://${DOMAIN}/bin/bhhs`;

let suggestionFetchController;

/**
 * Retrieves Suggestions from the suggestions API, but filters out results that aren't valid.
 *
 * @param {String} office the id of office for the site performing the search.
 * @param {String} keyword the partial for suggestion search
 *
 * @return {Promise<Object>|undefined} Promise with results or undefined if fetch was aborted.
 */
export async function getSuggestions(office, keyword) {
  suggestionFetchController?.abort();
  suggestionFetchController = new AbortController();
  const { signal } = suggestionFetchController;

  const endpoint = `${API_URL}/suggesterServlet?search_type=agent&keyword=${keyword}&office_id=${office}&_=${Date.now()}`;
  return fetch(endpoint, { signal })
    .then((resp) => {
      if (resp.ok) {
        return resp.json().then((data) => {
          Object.keys(data).forEach((k) => {
            if (!Filter.types.includes(k)) {
              delete data[k];
            }
          });
          return data;
        });
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
