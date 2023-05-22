const event = new Event('onResultUpdated');

function getResults() {
  return sessionStorage.getItem('result') ? JSON.parse(sessionStorage.getItem('result')) : { properties: '[]', count: '0', disclaimer: '' };
}

export function getPropertyDetails() {
  return getResults().properties;
}

export function getPropertiesCount() {
  return getResults().count;
}

export function getDisclaimer() {
  return getResults().disclaimer;
}
/**
 *
 * @param value
 */
export function setPropertyDetails(value) {
  sessionStorage.setItem('result', JSON.stringify(value));
  window.dispatchEvent(event);
}
