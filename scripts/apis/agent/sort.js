/**
 * Sort types for Agent Searches.
 */
export default class Sort {
  #id;

  #label;

  constructor(id, label) {
    this.#id = id;
    this.#label = label;
  }

  get id() {
    return this.#id;
  }

  get label() {
    return this.#label;
  }
}

Sort.LAST_NAME_ASC = new Sort(1, 'sortLastNameAsc');
Sort.LAST_NAME_DESC = new Sort(2, 'sortLastNameDesc');
// An id === 3 exists, but no idea what it is or means.
Sort.CITY_ASC = new Sort(4, 'sortCityAsc');
Sort.CITY_DESC = new Sort(5, 'sortCityDesc');
Sort.STATE_ASC = new Sort(6, 'sortStateAsc');
Sort.STATE_DESC = new Sort(7, 'sortStateDesc');

Sort.OPTIONS = [
  Sort.LAST_NAME_ASC,
  Sort.LAST_NAME_DESC,
  Sort.CITY_ASC,
  Sort.CITY_DESC,
  Sort.STATE_ASC,
  Sort.STATE_DESC,
];

/**
 * Find the sort given the type.
 *
 * @param {number} id the id of the sort
 * @return {Sort|undefined} the found sort
 */
export function sortFor(id) {
  let found;
  Sort.OPTIONS.every((s) => {
    found = s.id === id ? s : undefined;
    return s.id !== id;
  });
  return found;
}
