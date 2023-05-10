/**
 * Build the query string for the search API
 * @returns {string}
 */
export function getSearchObject() {
  const search = sessionStorage.getItem('search') ?? '{}';
  return JSON.parse(search);
}

function buildQueryParameters() {
  const search = getSearchObject();
  return Object.keys(search).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(search[key])}`).join('&');
}

/**
 * Build the query string for the search API
 * @returns {string}
 */
export function buildUrl() {
  const host = window.location.origin;
  return `${host}/search?${buildQueryParameters()}`;
}

/**
 * public methods for search
 * @param key
 * @param value
 */
export function setParam(key, value) {
  const parameters = getSearchObject();
  parameters[key] = value;
  sessionStorage.setItem('search', JSON.stringify(parameters));
}

export function getParam(key) {
  const parameters = getSearchObject();
  return parameters[key];
}

export function removeParam(key) {
  const parameters = getSearchObject();
  delete parameters[key];
  sessionStorage.setItem('search', JSON.stringify(parameters));
}
