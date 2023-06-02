/* Wrapper for all Creg API endpoints */

// eslint-disable-next-line no-unused-vars
import SearchParameters from './SearchParameters.js';

const urlParams = new URLSearchParams(window.location.search);
export const DOMAIN = urlParams.get('env') === 'stage' ? 'ignite-staging.bhhs.com' : 'www.bhhs.com';
const CREG_API_URL = `https://${DOMAIN}/bin/bhhs`;

let suggestionFetchController;

const mapSuggestions = (json) => {
  const results = [];
  const { searchTypes, suggestions } = json;

  if (!suggestions) {
    return results;
  }

  const keys = Object.keys(suggestions);
  keys.forEach((k) => {
    if (!suggestions[k.toLowerCase()]) {
      suggestions[k.toLowerCase()] = suggestions[k];
    }
  });
  searchTypes.forEach((type) => {
    const name = type.searchType.replaceAll(/\s+/g, '').toLowerCase();
    if (suggestions[name] && suggestions[name].length) {
      results.push({
        ...type,
        results: suggestions[name],
      });
    }
  });

  return results;
};

/**
 * Get suggestions for users based on their input and optional country.
 *
 * @param {String} keyword the partial for suggestion search
 * @param {String} [country=undefined] optional country for narrowing search
 *
 * @return {Promise<Object[]>|undefined}
 *    Any available suggestions, or undefined if the search was aborted.
 */
export async function getSuggestions(keyword, country = undefined) {
  suggestionFetchController?.abort();
  suggestionFetchController = new AbortController();

  const { signal } = suggestionFetchController;

  let endpoint = `${CREG_API_URL}/cregSearchSuggesterServlet?Keyword=${keyword}&_=${Date.now()}`;
  if (country) {
    endpoint += `&Country=${country}`;
  }

  return fetch(endpoint, { signal })
    .then((resp) => {
      if (resp.ok) {
        return resp.json().then(mapSuggestions);
      }
      // eslint-disable-next-line no-console
      console.log('Unable to fetch suggestions.');
      return [];
    }).catch((err) => {
      if (err.name === 'AbortError') {
        return undefined;
      }
      throw err;
    });
}

export function abortSuggestions() {
  suggestionFetchController?.abort();
}

/**
 * Perform a search.
 *
 * @param {SearchParameters} params the parameters
 */
export function propertySearch(params) {
  return new Promise((resolve) => {
    const queryParams = params.asQueryString();
    const worker = new Worker(`${window.hlx.codeBasePath}/scripts/apis/creg/workers/propertySearch.js`);
    const url = `${CREG_API_URL}/CregPropertySearchServlet?${queryParams}&_=${Date.now()}`;
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage({ url });
  });
}
