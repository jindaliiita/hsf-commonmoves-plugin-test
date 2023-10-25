import { fetchPlaceholders } from '../../../scripts/aem.js';
import Sort, { sortFor } from '../../../scripts/apis/agent/sort.js';
import { PAGE_PARAM } from './pagination.js';

export const SORT_PARAM = 'sort';
export const SORT_SELECTOR = '.sort-wrapper';

/**
 * Builds the Sort selector.
 *
 * @param {function} searchCallback the function to register when a search needs to be performed
 *
 * @return {Promise<HTMLDivElement>}
 */
export const buildSort = async (searchCallback) => {
  const urlParams = new URLSearchParams(window.location.search);
  let sortBy = Sort.LAST_NAME_ASC;
  if (urlParams.has(SORT_PARAM)) {
    sortBy = sortFor(parseInt(urlParams.get(SORT_PARAM), 10));
  }

  const placeholders = await fetchPlaceholders();
  const sort = document.createElement('div');
  sort.classList.add('sort-wrapper');
  sort.innerHTML = `
    <label for="agent-sort" role="presentation">Sort by</label>
    <select id="agent-sort"></select>
    <div class="select-wrapper">
      <div class="selected-sort" role="button" aria-haspopup="listbox" tabindex="0">${placeholders[sortBy.label]}</div>
      <ul class="sort-options" role="listbox" aria-expanded="false">
      </ul>
    </div>
  `;

  const select = sort.querySelector('#agent-sort');
  const ul = sort.querySelector('ul');

  Sort.OPTIONS.forEach((sortOpt) => {
    const option = document.createElement('option');
    option.value = sortOpt.id;
    option.textContent = placeholders[sortOpt.label];
    select.append(option);

    const li = document.createElement('li');
    li.classList.add('sort-item');
    li.setAttribute('role', 'option');
    li.setAttribute('data-value', sortOpt.id);
    li.textContent = placeholders[sortOpt.label];
    ul.append(li);

    if (sortOpt.id === sortBy.id) {
      li.classList.add('highlighted');
    }
  });
  select.value = sortBy.id;

  sort.querySelector('.selected-sort').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    ul.setAttribute('aria-expanded', ul.classList.toggle('visible'));
  });

  ul.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sortId = e.target.getAttribute('data-value');
    sort.querySelector('#agent-sort').value = sortId;
    urlParams.set(SORT_PARAM, sortId);
    urlParams.delete(PAGE_PARAM);
    searchCallback(urlParams);
  });
  return sort;
};
