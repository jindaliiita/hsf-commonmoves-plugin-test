import SearchType from './SearchType.js';
import PropertyType from './PropertyType.js';
import ApplicationType from './ApplicationType.js';

const parseQuery = (queryString) => {
  const parsed = {};
  queryString.split('&').map((kvp) => kvp.split('=')).forEach((kv) => {
    parsed[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
  });
  return parsed;
};

export const SortDirections = Object.freeze({
  ASC: 'ASCENDING',
  DESC: 'DESCENDING',
});

export const SortOptions = Object.freeze({
  DATE: 'DATE',
  PRICE: 'PRICE',
});

export default class SearchParameters {
  static DEFAULT_PAGE_SIZE = 32;

  ListingStatus; // TODO: Find out what this means

  MinPrice;

  NewListing = false;

  Page = 1;

  PageSize = 32;

  SearchInput = '';

  SearchType = '';

  #ApplicationType = ApplicationType.FOR_RENT.type;

  #PropertyType = [PropertyType.CONDO_TOWNHOUSE, PropertyType.SINGLE_FAMILY].join(',');

  #franchiseeCode;

  #isFranchisePage = false;

  #params = '';

  #sort = 'PRICE_DESCENDING';

  /**
   * Create a new instance of the SearchParameters.
   *
   * @param {SearchType} type the type of search to perform
   * @param {string} params the formatted params using the 'paramFormatterBuilder' from the type
   */
  constructor(type = SearchType.Empty, params = '') {
    this.SearchType = type.type;
    this.#params = params;
  }

  /**
   * Set the types of property status type to include in search.
   *
   * @param {ApplicationType[]} types
   */
  set applicationTypes(types) {
    this.#ApplicationType = types.map((t) => t.type).join(',');
  }

  /**
   * Set the franchisee ID for context search.
   *
   * @param id
   */
  set franchisee(id) {
    if (id) {
      this.#franchiseeCode = id.toUpperCase();
      this.#isFranchisePage = true;
    } else {
      this.#franchiseeCode = undefined;
      this.#isFranchisePage = false;
    }
  }

  /**
   * Set the property types to search against.
   *
   * @param {PropertyType[]} types
   */
  set propertyTypes(types) {
    this.#PropertyType = types.map((t) => t.ID).join(',');
  }

  /**
   * Set the sort type
   *
   * @param {('DATE'|'PRICE')} sort property on which to sort
   */
  set sortBy(sort) {
    const formatted = sort.toUpperCase();
    if (SortOptions[formatted]) {
      this.#sort = `${SortOptions[formatted]}_${this.#sort.split('_')[1]}`;
    }
  }

  /**
   * Set the sort direction
   *
   * @param {('ASC'|'DESC')} direction the direction of the sort
   */
  set sortDirection(direction) {
    const formatted = direction.toUpperCase();
    if (SortDirections[formatted]) {
      this.#sort = `${this.#sort.split('_')[0]}_${SortDirections[formatted]}`;
    }
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
    let query = Object.keys(this).filter((k) => this[k]).map((k) => `${k}=${encodeURIComponent(this[k])}`).join('&');
    query += `&Sort=${this.#sort}&isFranchisePage=${this.#isFranchisePage}`;
    if (this.#params) {
      query += `&${this.#params}`;
    }
    if (this.#franchiseeCode) {
      query += `&franchiseeCode=${this.#franchiseeCode}`;
    }

    return query;
  }
}
