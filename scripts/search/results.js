const event = new Event('onResultUpdated');

function getResults() {
  return sessionStorage.getItem('result') ? JSON.parse(sessionStorage.getItem('result')) : {
    properties: '[]', count: '0', disclaimer: '', listingClusters: '[]', result: '{}',
  };
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

export function getListingClusters() {
  return getResults().listingClusters;
}

export function getAllData() {
  return getResults().result;
}
/**
 *
 * @param value
 */
export function setPropertyDetails(value) {
  sessionStorage.setItem('result', JSON.stringify(value));
  window.dispatchEvent(event);
}
