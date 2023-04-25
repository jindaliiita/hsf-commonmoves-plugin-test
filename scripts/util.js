/**
 * Creates the standard Spinner Div.
 *
 * @returns {HTMLDivElement} the spinner div.
 */
export function getSpinner() {
  const div = document.createElement('div');
  div.classList.add('loading-spinner');
  div.innerHTML = '<span></span>';
  return div;
}

const Util = {
  getSpinner,
};

export default Util;
