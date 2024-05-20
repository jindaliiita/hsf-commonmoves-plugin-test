import {
  getSelected as getSelectedCountry,
} from '../search-countries/search-countries.js';
import {
  abort as abortSuggestions,
  get as getSuggestions,
} from '../../../scripts/apis/creg/suggestion.js';

const MORE_INPUT_NEEDED = 'Please enter at least 3 characters.';
const NO_SUGGESTIONS = 'No suggestions found. Please modify your search.';
const SEARCHING_SUGGESTIONS = 'Looking up suggestions...';

const updateSuggestions = (suggestions, target) => {
  // Keep the first item - required character entry count.
  const first = target.querySelector(':scope li');
  target.replaceChildren(first, ...suggestions);
};

const buildSuggestions = (suggestions) => {
  const lists = [];
  suggestions.forEach((category) => {
    const list = document.createElement('li');
    list.classList.add('list-title');
    list.textContent = category.displayText;
    lists.push(list);
    const ul = document.createElement('ul');
    list.append(ul);
    category.results.forEach((result) => {
      const li = document.createElement('li');
      li.setAttribute('category', category.searchType);
      li.setAttribute('display', result.displayText.trim());
      li.setAttribute('query', result.QueryString);
      li.setAttribute('type', new URLSearchParams(result.QueryString).get('SearchType'));
      li.textContent = result.SearchParameter;
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
  const { currentTarget } = e;
  const { value } = currentTarget;
  const searchBar = currentTarget.closest('.search-bar');
  if (value.length > 0) {
    searchBar.classList.add('show-suggestions');
  } else {
    searchBar.classList.remove('show-suggestions');
    searchBar.querySelector('input[name="query"]').value = '';
    searchBar.querySelector('input[name="type"]').value = '';
  }

  if (value.length <= 2) {
    abortSuggestions();
    target.querySelector(':scope > li:first-of-type').textContent = MORE_INPUT_NEEDED;
    updateSuggestions([], target);
  } else {
    target.querySelector(':scope > li:first-of-type').textContent = SEARCHING_SUGGESTIONS;
    getSuggestions(value, getSelectedCountry(currentTarget.closest('form')))
      .then((suggestions) => {
        if (!suggestions) {
          // Undefined suggestions means it was aborted, more input coming.
          updateSuggestions([], target);
          return;
        }
        if (suggestions.length) {
          updateSuggestions(buildSuggestions(suggestions), target);
        } else {
          target.querySelector(':scope > li:first-of-type').textContent = NO_SUGGESTIONS;
        }
      });
  }
};

const suggestionSelected = (e, form) => {
  const query = e.target.getAttribute('query');
  const keyword = e.target.getAttribute('display');
  const type = e.target.getAttribute('type');
  if (!query) {
    return;
  }
  form.querySelector('input[name="keyword"]').value = keyword;
  form.querySelector('input[name="query"]').value = query;
  form.querySelector('input[name="type"]').value = type;
  form.querySelector('.search-bar').classList.remove('show-suggestions');
};

export default function addEventListeners(form) {
  const suggestionsTarget = form.querySelector('.suggester-input .suggester-results');
  form.querySelector('.suggester-input input').addEventListener('input', (e) => {
    inputChanged(e, suggestionsTarget);
  });
  suggestionsTarget.addEventListener('click', (e) => {
    suggestionSelected(e, form);
  });
}
