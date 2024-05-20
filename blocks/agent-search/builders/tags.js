import Filter from '../../../scripts/apis/agent/Filter.js';

export const TAGS_SELECTOR = '.selection-tags';

const removeSelection = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains('close')) {
    e.target.closest('li').remove();
  }
};

/**
 * Add a new selected tag to the list.
 *
 * @param {HTMLElement} wrapper Some parent element containing the tags list.
 * @param filter the filter for the tag
 * @param value the value of the filter
 */
export const addSelectionTag = (wrapper, filter, value) => {
  const text = `${value} (${filter.label})`;
  const li = document.createElement('li');
  li.classList.add('selection-tags-item');
  li.innerHTML = `
    <span class="selection">${text}</span>
    <span class="close" aria-label="Remove - ${text}" role="button" tabindex="0">x</span>
    <input type="hidden" name="${filter.param}" data-category="${filter.type}" value="${value}"/>
  `;
  wrapper.querySelector('.selection-tags-list').append(li);
};

/**
 * Builds the Container for the search bar selections.
 *
 * @return {HTMLDivElement}
 */
export const buildSelectionTags = () => {
  const div = document.createElement('div');
  div.classList.add('selection-tags');
  div.innerHTML = '<ul class="selection-tags-list" role="presentation"></ul>';
  const ul = div.querySelector('.selection-tags-list');
  ul.addEventListener('click', removeSelection);

  const urlParams = new URLSearchParams(window.location.search);
  Object.getOwnPropertyNames(Filter)
    .filter((f) => Filter[f]?.type)
    .map((f) => ({ filter: Filter[f], values: urlParams.getAll(Filter[f].param) }))
    .forEach((list) => {
      list.values.forEach((v) => {
        addSelectionTag(div, list.filter, v);
      });
    });
  return div;
};
