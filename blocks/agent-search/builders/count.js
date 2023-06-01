/**
 * The selector for the count div.
 *
 * @type {string}
 */
export const COUNT_SELECTOR = '.result-count';

/**
 * The div to render the result count
 *
 * @param total total results
 *
 * @return {HTMLDivElement}
 */
export const buildCount = (total) => {
  const div = document.createElement('div');
  div.classList.add('result-count');
  div.innerHTML = `<span class="total">${total}</span>&nbsp;Results`;
  return div;
};
