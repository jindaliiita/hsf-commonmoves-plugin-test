import Sort from './sort.js';

export default class SearchParameters {
  brokerId;

  page = 1;

  pageSize = 10;

  #sort = Sort.LAST_NAME_ASC;

  #filters = {};

  constructor(office) {
    this.brokerId = office;
  }

  /**
   * Set the sort by
   *
   * @param {Sort} sort the sort
   */
  set sortBy(sort) {
    this.#sort = sort || Sort.LAST_NAME_ASC;
  }

  addFilter(filter, value) {
    this.#filters[filter.param] ||= [];
    this.#filters[filter.param].push(value);
  }

  asQueryString() {
    let str = `brokerID=${this.brokerId}&resultSize=${this.pageSize}&page=${this.page}&sortType=${this.#sort.id}`;
    Object.keys(this.#filters).forEach((param) => {
      this.#filters[param].forEach((v) => {
        str += `&${param}=${v}}`;
      });
    });
    return str;
  }
}
