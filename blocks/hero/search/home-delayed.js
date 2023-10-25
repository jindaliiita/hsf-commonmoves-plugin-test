import { getMetadata } from '../../../scripts/aem.js';
import { BREAKPOINTS } from '../../../scripts/scripts.js';
import {
  close as closeCountrySelect,
  getSelected as getSelectedCountry,
} from '../../shared/search-countries/search-countries.js';
import {
  abortSuggestions,
  getSuggestions,
  propertySearch,
  DOMAIN,
} from '../../../scripts/apis/creg/creg.js';
import { getSpinner } from '../../../scripts/util.js';
import SearchType from '../../../scripts/apis/creg/SearchType.js';
import SearchParameters from '../../../scripts/apis/creg/SearchParameters.js';

const noOverlayAt = BREAKPOINTS.medium;

const MORE_INPUT_NEEDED = 'Please enter at least 3 characters.';
const NO_SUGGESTIONS = 'No suggestions found. Please modify your search.';
const SEARCHING_SUGGESTIONS = 'Looking up suggestions...';

const fixOverlay = () => {
  if (noOverlayAt.matches) {
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.overflowY = null;
  }
};

const showFilters = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.closest('form').classList.add('show-filters');
  if (!noOverlayAt.matches) {
    document.body.style.overflowY = 'hidden';
  }
};

const closeFilters = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const thisForm = e.currentTarget.closest('form');
  thisForm.classList.remove('show-filters');
  thisForm.querySelectorAll('.select-wrapper.open').forEach((select) => {
    select.classList.remove('open');
  });

  if (!noOverlayAt.matches) {
    document.body.style.overflowY = 'hidden';
  }
};

const selectClicked = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const wrapper = e.currentTarget.closest('.select-wrapper');
  const wasOpen = wrapper.classList.contains('open');
  const thisForm = e.currentTarget.closest('form');
  thisForm.querySelectorAll('.select-wrapper.open').forEach((select) => {
    select.classList.remove('open');
  });
  closeCountrySelect(thisForm);
  if (!wasOpen) {
    wrapper.classList.add('open');
  }
};

const selectFilterClicked = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const count = e.currentTarget.textContent;
  const wrapper = e.currentTarget.closest('.select-wrapper');
  wrapper.querySelector('.selected').textContent = count;
  wrapper.querySelector('ul li.selected')?.classList.toggle('selected');
  e.currentTarget.classList.add('selected');
  wrapper.querySelector('select option[selected="selected"]')?.removeAttribute('selected');
  wrapper.querySelector(`select option[value="${count.replace('+', '')}"]`).setAttribute('selected', 'selected');
  wrapper.classList.toggle('open');
};

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
      li.setAttribute('display', result.displayText);
      li.setAttribute('query', result.QueryString);
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
    getSuggestions(value, getSelectedCountry(e.currentTarget.closest('form')))
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
  if (!query) {
    return;
  }
  form.querySelector('input[name="keyword"]').value = keyword;
  form.querySelector('input[name="query"]').value = query;
  form.querySelector('.search-bar').classList.remove('show-suggestions');
};

const formSubmitted = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const spinner = getSpinner();
  const form = e.currentTarget.closest('form');
  form.prepend(spinner);

  const franchisee = getMetadata('office-id');
  const type = SearchType[form.querySelector('input[name="type"]').value];
  const query = form.querySelector('input[name="query"]').value;
  const input = form.querySelector('input[name="keyword"]').value;
  const params = new SearchParameters(type);
  params.SearchInput = input;
  if (query) {
    params.populate(query);
  }

  if (franchisee) {
    params.franchisee = franchisee;
  }
  params.PageSize = 1;
  propertySearch(params).then((results) => {
    if (!results?.properties) {
      // What to do here?
      spinner.remove();
      return;
    }

    const domain = results.vanityDomain || `https://${DOMAIN}`;
    const searchPath = '/search';
    params.PageSize = SearchParameters.DEFAULT_PAGE_SIZE;
    params.ApplicationType = results.ApplicationType || params.ApplicationType;
    params.PropertyType = results.PropertyType || params.PropertyType;
    window.location = `${domain}${searchPath}?${params.asQueryString()}`;
  });
};

function addEventListeners() {
  const form = document.querySelector('.hero.block form.homes');

  noOverlayAt.addEventListener('change', fixOverlay);

  form.querySelectorAll('button[type="submit"]').forEach((button) => {
    button.addEventListener('click', formSubmitted);
  });

  form.querySelector('button.filter').addEventListener('click', showFilters);

  form.querySelectorAll('button.close').forEach((button) => {
    button.addEventListener('click', closeFilters);
  });

  form.querySelectorAll('.select-wrapper .selected').forEach((button) => {
    button.addEventListener('click', selectClicked);
  });

  form.querySelectorAll('.select-wrapper .select-items li').forEach((li) => {
    li.addEventListener('click', selectFilterClicked);
  });

  const suggestionsTarget = form.querySelector('.suggester-input .suggester-results');
  form.querySelector('.suggester-input input').addEventListener('input', (e) => {
    inputChanged(e, suggestionsTarget);
  });
  suggestionsTarget.addEventListener('click', (e) => {
    suggestionSelected(e, form);
  });
}

addEventListeners();
