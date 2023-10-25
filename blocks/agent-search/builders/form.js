import { getMetadata } from '../../../scripts/aem.js';
import { BREAKPOINTS } from '../../../scripts/scripts.js';

import { abortSuggestions, getSuggestions } from '../../../scripts/apis/agent/suggestion.js';
import { fromType as filterFromType } from '../../../scripts/apis/agent/Filter.js';
import { addSelectionTag } from './tags.js';
import { SORT_PARAM } from './sort.js';
import { PER_PAGE_PARAM } from './pagination.js';

const MORE_INPUT_NEEDED = 'Please enter at least 3 characters.';
const NO_SUGGESTIONS = 'No suggestions found. Please modify your search.';
const SEARCHING_SUGGESTIONS = 'Looking up suggestions...';

const officeId = getMetadata('office-id');

export const getPlaceholder = () => (BREAKPOINTS.small.matches ? 'Search by Agent Name, Team Name, Location, Language or Designations' : 'Search by Name, Location and More...');

/**
 * The selector for the search form div.
 *
 * @type {string}
 */
export const FORM_SELECTOR = '.search-bar';

const buildUrlParams = (wrapper) => {
  const hiddens = wrapper.querySelectorAll('input[type="hidden"]');
  const newParams = [];

  const existingUrlParams = new URLSearchParams(window.location.search);
  if (existingUrlParams.has(SORT_PARAM)) {
    newParams.push([SORT_PARAM, existingUrlParams.get(SORT_PARAM)]);
  }
  if (existingUrlParams.has(PER_PAGE_PARAM)) {
    newParams.push([PER_PAGE_PARAM, existingUrlParams.get(PER_PAGE_PARAM)]);
  }

  [...hiddens].forEach((hidden) => {
    const filter = filterFromType(hidden.getAttribute('data-category'));
    newParams.push([filter.param, hidden.value]);
  });
  return new URLSearchParams(newParams);
};

const updateSuggestions = (suggestions, target) => {
  // Keep the first item - required character entry count.
  const first = target.querySelector(':scope li');
  target.replaceChildren(first, ...suggestions);
};

const suggestionSelected = (e, wrapper) => {
  e.preventDefault();
  e.stopPropagation();
  const category = e.target.getAttribute('category');
  if (!category) {
    return;
  }

  const selected = e.target;
  const filter = filterFromType(category);
  const value = selected.textContent;
  addSelectionTag(wrapper, filter, value);

  wrapper.querySelector('.search-bar').classList.remove('show-suggestions');
  wrapper.querySelector('input[type="text"]').value = '';
  updateSuggestions([], wrapper.querySelector('.search-suggester .suggester-results'));
};

const buildSuggestions = (suggestions) => {
  const lists = [];
  Object.keys(suggestions).forEach((category) => {
    const item = document.createElement('li');
    item.classList.add('list-title');
    item.textContent = category;
    lists.push(item);
    const ul = document.createElement('ul');
    item.append(ul);
    suggestions[category].forEach((entry) => {
      const li = document.createElement('li');
      li.setAttribute('category', category);
      li.textContent = entry;
      ul.append(li);
    });
  });
  return lists;
};

/**
 * Handles the input changed event for the text field. Will add suggestions based on user input.
 *
 * @param {Event} e the change event
 * @param {HTMLElement} target the container in which to add suggestions
 */
const inputChanged = (e, target) => {
  const { value } = e.currentTarget;
  if (value.length > 0) {
    e.currentTarget.closest('.search-bar').classList.add('show-suggestions');
  } else {
    e.currentTarget.closest('.search-bar').classList.remove('show-suggestions');
  }

  if (value.length <= 2) {
    abortSuggestions();
    target.querySelector(':scope > li:first-of-type').textContent = MORE_INPUT_NEEDED;
    updateSuggestions([], target);
  } else {
    target.querySelector(':scope > li:first-of-type').textContent = SEARCHING_SUGGESTIONS;
    getSuggestions(officeId, value)
      .then((suggestions) => {
        if (!suggestions) {
          // Undefined suggestions means it was aborted, more input coming.
          updateSuggestions([], target);
          return;
        }
        if (Object.keys(suggestions).length > 0) {
          updateSuggestions(buildSuggestions(suggestions), target);
        } else {
          updateSuggestions([], target);
          target.querySelector(':scope > li:first-of-type').textContent = NO_SUGGESTIONS;
        }
      });
  }
};

/**
 * Builds the Sort selector.
 *
 * @param {function} searchCallback the function to register when a search needs to be performed
 *
 * @return {HTMLDivElement}
 */
export const buildSearchBar = (searchCallback) => {
  const placeholder = getPlaceholder();
  const searchBar = document.createElement('div');
  searchBar.classList.add('search-bar');
  searchBar.setAttribute('role', 'search');
  searchBar.innerHTML = `
    <div class="search-suggester">
      <input type="text" placeholder="${placeholder}" aria-label="${placeholder}" name="keyword">
      <ul class="suggester-results">
        <li class="list-title">Please enter at least 3 characters.</li>
      </ul>
    </div>
    <button class="search-submit" aria-label="Search Agents" type="submit">
      <span>Search</span>
    </button>
  `;

  BREAKPOINTS.small.addEventListener('change', () => {
    const text = getPlaceholder();
    const input = searchBar.querySelector('input[name="keyword"]');
    input.setAttribute('placeholder', text);
    input.setAttribute('aria-label', text);
  });

  const suggestionsTarget = searchBar.querySelector('.search-suggester .suggester-results');
  searchBar.querySelector('.search-suggester input').addEventListener('input', (e) => {
    inputChanged(e, suggestionsTarget);
  });
  suggestionsTarget.addEventListener('click', (e) => {
    suggestionSelected(e, searchBar.parentElement);
  });

  searchBar.querySelector('button[type="submit"]').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    searchCallback(buildUrlParams(searchBar.parentElement));
  });

  return searchBar;
};
