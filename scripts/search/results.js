const event = new Event('onResultChange');

export function getPropertyDetails() {
  const result = sessionStorage.getItem('result') ?? '{}';
  return JSON.parse(result);
}

/**
 *
 * @param value
 */
export function setPropertyDetails(value) {
  sessionStorage.setItem('result', value);
  window.dispatchEvent(event);
}
