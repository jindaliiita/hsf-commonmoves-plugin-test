/**
 * Types of Filters
 */
export default class Filter {
  static #TYPES = [];

  constructor(type, param, label) {
    this.type = type;
    this.param = param;
    this.label = label;
    Filter.#TYPES.push(type);
  }

  /**
   * A list of all the types by their type keyword.
   *
   * @return {string[]}
   */
  static get types() {
    return [...Filter.#TYPES];
  }
}

Filter.NAME = new Filter('name', 'full_name', 'Name');
Filter.CITY = new Filter('city', 'city', 'City');
Filter.STATE = new Filter('state', 'state', 'State');
Filter.POSTAL_CODE = new Filter('zipcode', 'postal_code', 'Postal');
Filter.COUNTRY = new Filter('country', 'country', 'Country');
Filter.LANGUAGE = new Filter('language', 'language', 'Country');
Filter.DESIGNATION = new Filter('designation', 'designation', 'Designation');

export function fromType(type) {
  const [found] = Object.getOwnPropertyNames(Filter)
    .filter((t) => Filter[t]?.type === type)
    .map((t) => Filter[t]);

  return found;
}

export function fromParam(param) {
  const [found] = Object.getOwnPropertyNames(Filter)
    .filter((t) => Filter[t]?.param === param)
    .map((t) => Filter[t]);

  return found;
}
