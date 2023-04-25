/* Wrapper for all Creg API endpoints */

const urlParams = new URLSearchParams(window.location.search);
export const DOMAIN = urlParams.get('env') === 'stage' ? 'ignite-staging.bhhs.com' : 'www.bhhs.com';
const CREG_API_URL = `https://${DOMAIN}/bin/bhhs`;

let suggestionFetchController;

const parseQuery = (queryString) => {
  const parsed = {};
  queryString.split('&').map((kvp) => kvp.split('=')).forEach((kv) => {
    parsed[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
  });
  return parsed;
};

export class SearchParameters {
  static DEFAULT_PAGE_SIZE = 32;

  ApplicationType = 'FOR_SALE';

  ListingStatus = '1';

  NewListing = false;

  Page = 1;

  PageSize = 32;

  PropertyType = '1,2';

  SearchInput = '';

  SearchParameter = '';

  SearchType = '';

  Sort = 'PRICE_DESCENDING';

  franchiseeCode;

  isFranchisePage;

  set franchisee(id) {
    if (id) {
      this.franchiseeCode = id.toUpperCase();
      this.isFranchisePage = true;
    } else {
      this.franchiseeCode = undefined;
      this.isFranchisePage = false;
    }
  }

  constructor(type, input) {
    this.SearchType = type;
    this.SearchInput = input;
  }

  /**
   * Populates this search parameter from the provided query string.
   *
   * @param {String} queryString the query string to parse
   */
  populate(queryString) {
    const query = parseQuery(queryString);
    Object.keys(this).forEach((p) => {
      if (query[p]) {
        this[p] = query[p];
      }
    });
  }

  /**
   * Converts this Search Parameter object into its URL query parameter equivalent
   *
   * @return {String} URL encoded representation of this
   */
  asQueryString() {
    return Object.keys(this).filter((k) => this[k]).map((k) => `${k}=${encodeURIComponent(this[k])}`).join('&');
  }
}

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
export async function propertySearch(params) {
  const queryParams = params.asQueryString();
  const url = `${CREG_API_URL}/CregPropertySearchServlet?${queryParams}&_=${Date.now()}`;
  const resp = await fetch(url);
  if (resp.ok) {
    return resp.json();
  }
  return {};
}
