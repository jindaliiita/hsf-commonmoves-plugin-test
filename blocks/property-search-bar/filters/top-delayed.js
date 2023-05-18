import { abortSuggestions, getSuggestions } from '../../../scripts/apis/creg/creg.js';
import { getAttributes, setSearchParams } from '../search/suggestion.js';
import {
  populatePreSelectedFilters,
  setFilterValue,
} from '../filter-processor.js';
import {
  formatPriceLabel, closeTopLevelFilters, togglePropertyForm, hideFilter,
} from '../common-function.js';

const event = new Event('onFilterChange');

const MORE_INPUT_NEEDED = 'Please enter at least 3 characters.';
const NO_SUGGESTIONS = 'No suggestions found. Please modify your search.';
const SEARCHING_SUGGESTIONS = 'Looking up suggestions...';

function showFilter(element) {
  element.classList.add('open');
  element.querySelector('.search-results-dropdown').classList.remove('hide');
}

const updateSuggestions = (suggestions, target) => {
  // Keep the first item - required character entry count.
  const first = target.querySelector(':scope li');
  target.replaceChildren(first, ...suggestions);
};

const createPriceList = (d) => {
  let optionlist = '';
  const k = [10, 100, 1E3, 1E4, 1E5, 1E6];
  // eslint-disable-next-line no-plusplus
  if (d) for (let m = 1; m <= 6; m++) optionlist += `<option> ${d * k[m - 1]} </option>`;
  return optionlist;
};

function addChangeHandler(filter) {
  let value;
  filter.forEach((el) => {
    el.addEventListener('change', () => {
      if (el.checked) {
        filter.forEach((input) => {
          if (input.id !== el.id) input.checked = false;
        });
        value = el.value === 'Any' ? '' : el.value;
        setFilterValue(el.closest('.filter').getAttribute('name'), value);
      }
    });
  });
}

const buildSuggestions = (suggestions) => {
  const lists = [];
  let attr;
  suggestions.forEach((category) => {
    const list = document.createElement('li');
    list.classList.add('list-title');
    list.textContent = category.displayText;
    lists.push(list);
    const ul = document.createElement('ul');
    list.append(ul);
    category.results.forEach((result) => {
      const li = document.createElement('li');
      attr = getAttributes(result);
      Object.keys(attr).forEach((key) => {
        li.setAttribute(key, attr[key]);
      });
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
    getSuggestions(value)
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

const suggestionSelected = (e, block) => {
  const searchParameter = e.target.getAttribute('search-parameter');
  const keyword = e.target.getAttribute('search-input');
  if (!searchParameter) {
    return;
  }
  setSearchParams(e.target);
  block.querySelector('input[name="keyword"]').value = keyword;
  block.querySelector('.search-bar').classList.remove('show-suggestions');
  window.dispatchEvent(event);
};

function addEventListeners() {
  const block = document.querySelector('.property-search-bar.block');
  const priceRangeInputs = block.querySelector('.container-item[name="Price"] .multiple-inputs');

  // update top menu  input placeholder on click
  block.querySelectorAll('.container-item .select-item .tooltip-container').forEach((element) => {
    element.addEventListener('click', () => {
      let selectedElValue = element.innerText;
      const value = element.getAttribute('data-value');
      const container = element.closest('.container-item');
      let name = container.getAttribute('name');
      container.querySelector('.highlighted').classList.remove('highlighted');
      element.classList.toggle('highlighted');
      const headerTitle = container.querySelector('.header .title');
      if (container.querySelector('.multiple-inputs')) {
        // logic
        element.closest('section > div').querySelector('.select-selected').innerHTML = selectedElValue;
        name = element.closest('section > div').querySelector('.select-selected').getAttribute('name');
        const headerItems = container.querySelectorAll('.multiple-inputs .select-selected');
        const fromSelectedValue = headerItems[0].innerText;
        const toSelectedValue = headerItems[1].innerText;
        if (fromSelectedValue === 'No Min' && toSelectedValue === 'No Max') {
          selectedElValue = 'square feet';
        } else {
          selectedElValue = `${fromSelectedValue}-${toSelectedValue}`;
        }
        element.closest('.select-item').classList.remove('show');
      } else {
        hideFilter(container);
      }
      setFilterValue(name, value);
      headerTitle.innerHTML = `<span>${selectedElValue}</span>`;
      window.dispatchEvent(event);
    });
  });

  // add logic on price range change
  priceRangeInputs.addEventListener('keyup', (e) => {
    const minPrice = priceRangeInputs.querySelector('[name="MinPrice"]').value;
    const maxPrice = priceRangeInputs.querySelector('[name="MaxPrice"]').value;
    // display datalist
    const activeElement = e.target.closest('.price-range-input');
    const name = activeElement.getAttribute('name');
    const { value } = activeElement;
    activeElement.list.innerHTML = createPriceList(activeElement.value);

    // update label
    block.querySelector('[name="Price"] .title > span').innerText = formatPriceLabel(minPrice, maxPrice);
    setFilterValue(name, value);
    window.dispatchEvent(event);
  });

  block.querySelectorAll('.container-item .header').forEach((selectedFilter) => {
    selectedFilter.addEventListener('click', () => {
      const isOpened = selectedFilter.parentElement.classList.contains('open');
      closeTopLevelFilters();
      if (!isOpened) {
        showFilter(selectedFilter.parentElement);
      }
    });
  });
  // baths and beds
  addChangeHandler(block.querySelectorAll('[name="MinBathroomsTotal"] input'));
  addChangeHandler(block.querySelectorAll('[name="MinBedroomsTotal"] input'));

  // open additional filters
  block.querySelector('.filter-container').addEventListener('click', () => {
    togglePropertyForm();
    const overlay = document.querySelector('.overlay');
    const toggledOnClose = overlay.classList.contains('hide');
    closeTopLevelFilters(false);
    if (toggledOnClose) {
      setFilterValue('MinPrice', document.querySelector('.filter [name="MinPrice"]').value);
      setFilterValue('MaxPrice', document.querySelector('.filter [name="MaxPrice"]').value);
    }
    populatePreSelectedFilters(toggledOnClose);
  });

  block.querySelectorAll('.select-selected').forEach((el) => {
    let isOpened;
    el.addEventListener('click', () => {
      if (el.closest('.multiple-inputs').getAttribute('name') === 'Sort') {
        isOpened = document.querySelector('[name="Sort"] .select-item').classList.contains('show');
        closeTopLevelFilters();
        if (isOpened) {
          document.querySelector('[name="Sort"] .select-item').classList.add('show');
        }
      }
      el.closest('section > div').querySelector('.select-item').classList.toggle('show');
    });
  });
  // suggestions
  const suggestionsTarget = block.querySelector('.suggester-input .suggester-results');
  block.querySelector('.search-listing-block  [name="keyword"]').addEventListener('input', (e) => {
    inputChanged(e, suggestionsTarget);
  });
  suggestionsTarget.addEventListener('click', (e) => {
    suggestionSelected(e, block);
  });
}

addEventListeners();
