import { getMetadata } from '../../../scripts/lib-franklin.js';
import { BREAKPOINTS } from '../../../scripts/scripts.js';
import {
  getSuggestions,
  abortSuggestions,
} from '../../../scripts/apis/suggestion/suggestion.js';
import { getPlaceholder } from './agent.js';

const MORE_INPUT_NEEDED = 'Please enter at least 3 characters.';
const NO_SUGGESTIONS = 'No suggestions found. Please modify your search.';
const SEARCHING_SUGGESTIONS = 'Looking up suggestions...';

const SEARCH_TYPE = 'agent';

const updateSuggestions = (suggestions, target) => {
  // Keep the first item - required character entry count.
  const first = target.querySelector(':scope li');
  target.replaceChildren(first, ...suggestions);
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
    const officeId = getMetadata('office-id');
    getSuggestions(SEARCH_TYPE, officeId, value)
      .then((suggestions) => {
        if (!suggestions) {
          // Undefined suggestions means it was aborted, more input coming.
          updateSuggestions([], target);
          return;
        }
        if (Object.keys(suggestions).length) {
          updateSuggestions(buildSuggestions(suggestions), target);
        } else {
          target.querySelector(':scope > li:first-of-type').textContent = NO_SUGGESTIONS;
        }
      });
  }
};

const createSelectionTag = (selection) => {
  const category = selection.getAttribute('category');
  const value = selection.textContent;
  const text = `${value} (${category})`;
  const li = document.createElement('li');
  li.classList.add('selection-tags-item');
  li.innerHTML = `
    <span class="selection">${text}</span>
    <span class="close" aria-label="Remove - ${text}" role="button" tabindex="0">x</span>
    <input type="hidden" name="${category}" value="${value}"/>
  `;
  return li;
};

const suggestionSelected = (e, form) => {
  e.preventDefault();
  e.stopPropagation();
  const category = e.target.getAttribute('category');
  if (!category) {
    return;
  }
  form.querySelector('.selection-tags-list').append(createSelectionTag(e.target));
  form.querySelector('.search-bar').classList.remove('show-suggestions');
  updateSuggestions([], form.querySelector('.search-suggester .suggester-results'));
};

const removeSelection = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains('close')) {
    e.target.closest('li').remove();
  }
};

const formSubmitted = (e) => {
  // Don't want to submit the keyword input.
  const form = e.currentTarget.closest('form');
  const data = new FormData(form);
  data.delete('keyword');
  window.location.href = `${form.action}?${new URLSearchParams(data).toString()}`;
};

function addEventListeners() {
  const form = document.querySelector('.hero.block form.agents');

  BREAKPOINTS.small.addEventListener('change', () => {
    const text = getPlaceholder();
    const input = form.querySelector('input[name="keyword"]');
    input.setAttribute('placeholder', text);
    input.setAttribute('aria-label', text);
  });

  form.querySelector('button[type="submit"]').addEventListener('click', formSubmitted);

  const suggestionsTarget = form.querySelector('.search-suggester .suggester-results');
  form.querySelector('.search-suggester input').addEventListener('input', (e) => {
    inputChanged(e, suggestionsTarget);
  });
  suggestionsTarget.addEventListener('click', (e) => {
    suggestionSelected(e, form);
  });
  form.querySelector('.selection-tags-list').addEventListener('click', removeSelection);
}

addEventListeners();
