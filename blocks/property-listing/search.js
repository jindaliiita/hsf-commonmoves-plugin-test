import SearchParameters, { SortDirections, SortOptions } from '../../scripts/apis/creg/SearchParameters.js';
import { render as renderCards } from './cards/cards.js';
// eslint-disable-next-line no-unused-vars
import SearchType from '../../scripts/apis/creg/SearchType.js';

// function addMoreButton() {
// TODO: add this logic if there's supposed to be more results;
// }

export default class Search {
  #searchParams;

  /**
   * Create a new Search object. (should not be called directly)
   *
   * @param {SearchType} type
   * @param {string} params the result of the paramBuilder for the specified type.
   */
  constructor(type, params) {
    this.#searchParams = new SearchParameters(type, params);
  }

  isNew;

  isOpenHouse;

  listingTypes;

  maxPrice;

  minPrice;

  officeId;

  pageSize;

  propertyTypes;

  sortBy;

  sortDirection;

  // eslint-disable-next-line no-unused-vars
  async render(parent, enableMore = false) {
    this.#searchParams.MinPrice = this.minPrice;
    this.#searchParams.MaxPrice = this.maxPrice;
    this.#searchParams.PageSize = this.pageSize || SearchParameters.DEFAULT_PAGE_SIZE;
    this.#searchParams.sortBy = this.sortBy || SortOptions.DATE;
    this.#searchParams.sortDirection = this.sortDirection || SortDirections.DESC;
    this.#searchParams.propertyTypes = this.propertyTypes;
    this.#searchParams.applicationTypes = this.listingTypes;
    this.#searchParams.NewListing = this.isNew || this.#searchParams.NewListing;
    this.#searchParams.OpenHouses = this.isOpenHouse ? '7' : undefined;
    this.#searchParams.franchisee = this.officeId;

    await renderCards(this.#searchParams, parent);
    // TODO: Enable the "Load More" for the Property Search page.
  }
}
