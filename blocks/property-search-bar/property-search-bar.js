import { build as buildCountrySelect } from '../shared/search-countries/search-countries.js';
import { build as buildTopMenu, buildFilterSearchTypesElement } from './top-menu.js';
import { build as buildAdditionFilters, buildFilterButtons } from './additional-filters.js';
import {
  getPlaceholder, formatPriceLabel, buildKeywordEl, toggleOverlay,
} from './common-function.js';
import {
  populatePreSelectedFilters,
  setFilterValue,
  removeFilterValue,
  getValueFromStorage, setInitialValuesFromUrl, searchProperty,
} from './filter-processor.js';

function hideFilter(element) {
  element.classList.remove('open');
  element.querySelector('.search-results-dropdown').classList.add('hide');
}

function showFilter(element) {
  element.classList.add('open');
  element.querySelector('.search-results-dropdown').classList.remove('hide');
}

function createPriceList(d) {
  let optionlist = '';
  const k = [10, 100, 1E3, 1E4, 1E5, 1E6];
  // eslint-disable-next-line no-plusplus
  if (d) for (let m = 1; m <= 6; m++) optionlist += `<option> ${d * k[m - 1]} </option>`;
  return optionlist;
}

function toggleFilter(el) {
  const div = el.querySelector('.checkbox');
  const name = el.closest('.filter').getAttribute('name');
  div.classList.toggle('checked');
  let value = div.classList.contains('checked');
  el.querySelector('input').value = value;
  if (name === 'ApplicationType') {
    value = [];
    el.closest('[name="ApplicationType"]').querySelectorAll('.filter-toggle .checked').forEach((elem) => {
      value.push(elem.parentElement.getAttribute('name'));
    });
    value = value.join(',');
  }
  setFilterValue(name, value);
}

function updateFilters(el) {
  const filter = el.closest('.filter');
  const forRentEl = filter.querySelector('.for-rent');
  const pendingEl = filter.querySelector('.pending');
  const isForRentChecked = filter.querySelector('.for-rent .checkbox').classList.contains('checked');
  const isPendingChecked = filter.querySelector('.pending .checkbox').classList.contains('checked');

  forRentEl.classList.toggle('disabled', isPendingChecked);
  pendingEl.classList.toggle('disabled', isForRentChecked);
}

function addChangeHandler(filter) {
  filter.forEach((el) => {
    el.addEventListener('change', () => {
      if (el.checked) {
        filter.forEach((input) => {
          if (input.id !== el.id) input.checked = false;
        });

        if (el.value === 'Any') {
          removeFilterValue(el.closest('.filter').getAttribute('name'));
        } else {
          setFilterValue(el.closest('.filter').getAttribute('name'), el.value);
        }
      }
    });
  });
}

function closeTopLevelFilters() {
  document.querySelectorAll('.container-item .header').forEach((elem) => {
    if (elem.parentElement.classList.contains('open')) {
      hideFilter(elem.parentElement);
    }
    if (elem.parentElement.querySelectorAll('.select-item').length > 0) {
      elem.parentElement.querySelectorAll('.select-item').forEach((el) => {
        el.classList.remove('show');
      });
    }
  });
  if (document.querySelector('[name="Sort"] .select-item').classList.contains('show')) {
    document.querySelector('[name="Sort"] .select-item').classList.remove('show');
  }
  document.querySelector('[name="country-select"]').classList.remove('open');
}

function togglePropertyForm() {
  const svgIcons = document.querySelectorAll('.filter-container svg');
  const overlay = document.querySelector('.overlay');
  const hideClass = 'hide';
  document.querySelector('.filter-block').classList.toggle(hideClass);
  toggleOverlay();
  document.querySelector('.filter-buttons').classList.toggle(hideClass);
  svgIcons.forEach((el) => el.classList.toggle(hideClass));
  const toggledOnClose = overlay.classList.contains(hideClass);
  if (!overlay.classList.contains(hideClass)) {
    setFilterValue('MinPrice', document.querySelector('.filter [name="MinPrice"]').value);
    setFilterValue('MaxPrice', document.querySelector('.filter [name="MaxPrice"]').value);
  }
  closeTopLevelFilters();
  populatePreSelectedFilters(!toggledOnClose);
}

export default async function decorate(block) {
  setInitialValuesFromUrl();
  /** build top menu html */
  const overlay = document.createElement('div');
  overlay.classList.add('overlay', 'hide');
  const additionalConfig = document.createElement('div');
  additionalConfig.append(buildFilterSearchTypesElement());
  block.append(buildTopMenu(), buildAdditionFilters(), overlay, buildFilterButtons());
  const changeCountry = (country) => {
    const placeholder = getPlaceholder(country);
    const input = block.querySelector('.suggester-input input');
    input.setAttribute('placeholder', placeholder);
    input.setAttribute('aria-label', placeholder);
  };

  const countrySelect = await buildCountrySelect(changeCountry);
  countrySelect.setAttribute('name', 'country-select');
  block.querySelector('.primary-search').prepend(countrySelect);

  /** eventing */

  const priceRangeInputs = block.querySelector('.container-item[name="Price"] .multiple-inputs');
  const propertyButtons = block.querySelectorAll('[name="PropertyType"] button');
  const openHousesFilter = block.querySelector('[name="OpenHouses"]');
  const openHousesCheckbox = openHousesFilter.querySelector('input[type="checkbox"]');
  const keyWordSearchAny = block.querySelector('[name="Features"] .filter-radiobutton input[name="matchTagsAny"]');
  const keyWordSearchAll = block.querySelector('[name="Features"] .filter-radiobutton input[name="matchTagsAll"]');

  populatePreSelectedFilters();
  // close form on click cancel button
  block.querySelector('.filter-buttons a[title="cancel"]').addEventListener('click', () => {
    togglePropertyForm();
  });
  // reset form on click reset button
  block.querySelector('.filter-buttons a[title="reset"]').addEventListener('click', () => {
    // @todo set up initial values
    setInitialValuesFromUrl();
    // @todo test anf fix
    populatePreSelectedFilters(false);
  });
  // apply filters on click apply button
  block.querySelector('.filter-buttons a[title="apply"]').addEventListener('click', () => {
    togglePropertyForm();
    searchProperty();
  });
  // add logic for select on click
  block.querySelector('.filter-container').addEventListener('click', togglePropertyForm);

  // add key words to search
  block.querySelector('[name="Features"] .btn').addEventListener('click', () => {
    const keyword = block.querySelector('[name="Features"] input[type="text"]').value;
    if (keyword) {
      buildKeywordEl(keyword, removeFilterValue);
      setFilterValue('Features', keyword.trim());
    }
  });

  keyWordSearchAny.addEventListener('change', () => {
    if (keyWordSearchAny.checked) {
      keyWordSearchAll.checked = false;
      setFilterValue('MatchAnyFeatures', true);
    }
  });

  keyWordSearchAll.addEventListener('change', () => {
    if (keyWordSearchAll.checked) {
      keyWordSearchAny.checked = false;
      removeFilterValue('MatchAnyFeatures');
    }
  });
  block.querySelectorAll('#container-tags .close').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.target.parentNode.remove();
    });
  });

  // baths and beds
  addChangeHandler(block.querySelectorAll('[name="MinBathroomsTotal"] input', '[name="MinBedroomsTotal"] input'));

  block.querySelectorAll('[name="OpenHouses"] input[type="radio"]').forEach((el) => {
    el.addEventListener('change', () => {
      const name = el.getAttribute('name');
      if (name === 'openHousesOnlyWeekend' && el.checked) {
        setFilterValue('OpenHouses', 7);
        block.querySelector('[name="openHousesOnlyAnytime"]').checked = false;
      } else {
        setFilterValue('OpenHouses', 365);
        block.querySelector('[name="openHousesOnlyWeekend"]').checked = false;
      }
    });
  });

  openHousesCheckbox.addEventListener('change', () => {
    openHousesFilter.classList.toggle('selected');
    if (!openHousesCheckbox.checked) {
      removeFilterValue('OpenHouses');
    }
  });

  // select all property filters on select all
  block.querySelector('[name="PropertyType"] input[type="checkbox"]').addEventListener('change', () => {
    const isChecked = block.querySelector('[name="PropertyType"] input[type="checkbox"]').checked;
    propertyButtons.forEach((el) => {
      el.classList.toggle('selected', isChecked);
    });
    if (isChecked) {
      setFilterValue('PropertyType', '1,2,3,5,4,6');
    } else {
      removeFilterValue('PropertyType');
    }
  });
  // add logic to select property type on click
  propertyButtons.forEach((el) => {
    let value; let
      params;
    el.addEventListener('click', () => {
      el.classList.toggle('selected');
      value = el.getAttribute('value');
      params = getValueFromStorage('PropertyType');
      // eslint-disable-next-line no-unused-expressions
      el.classList.contains('selected') ? params.push(value) : params = params.filter((i) => i !== value);
      params = params.join(',');
      setFilterValue('PropertyType', params);
    });
  });

  // events for filters with type toggle
  block.querySelectorAll('.filter-toggle').forEach((el) => {
    el.addEventListener('click', () => {
      toggleFilter(el);
      if (el.classList.contains('for-rent') || el.classList.contains('pending')) {
        updateFilters(el);
      }
    });
  });

  // close filters on click outside
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      closeTopLevelFilters();
    }
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
    searchProperty();
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
      searchProperty();
    });
  });

  // year, square feet, sort input logic on additional filters
  block.querySelectorAll('.filter .select-item .tooltip-container').forEach((element) => {
    element.addEventListener('click', () => {
      const selectedElValue = element.innerText;
      const container = element.closest('section');
      const filter = element.closest('.filter');
      let name = filter.getAttribute('name');
      let value = element.getAttribute('data-value');
      container.querySelector('.highlighted').classList.remove('highlighted');
      element.classList.toggle('highlighted');
      const headerTitle = container.querySelector('.select-selected');
      if (name === 'Sort') {
        headerTitle.innerText = selectedElValue;
      } else {
        headerTitle.innerHTML = `<span>${selectedElValue}</span>`;
      }
      if (filter.querySelector('.multiple-inputs')) {
        if (name !== 'YearBuilt') {
          name = element.closest('section > div').querySelector('.select-selected').getAttribute('name');
        }
        if (name === 'YearBuilt') {
          const values = element.closest('.multiple-inputs').querySelectorAll('.select-selected');
          if (values[0].innerText === 'No Min' && values[1].innerText === 'No Max') {
            removeFilterValue('YearBuilt');
            return;
          }
          const minYear = values[0].innerText === 'No Min' ? 1899 : values[0].innerText;
          const maxYear = values[1].innerText === 'No Max' ? 2100 : values[1].innerText;
          value = `${minYear}-${maxYear}`;
        }
        element.closest('.select-item').classList.remove('show');
      }
      setFilterValue(name, value);
      element.closest('.select-item').classList.remove('show');
    });
  });
}
