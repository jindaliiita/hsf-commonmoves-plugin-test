import {
  removeFilterValue,
  setFilterValue,
} from '../filter-processor.js';
import { buildKeywordEl, updateFilters } from '../common-function.js';

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

function addEventListeners() {
  const block = document.querySelector('.property-search-bar.block');
  const propertyButtons = block.querySelectorAll('[name="PropertyType"] button');
  const openHousesFilter = block.querySelector('[name="OpenHouses"]');
  const openHousesCheckbox = openHousesFilter.querySelector('input[type="checkbox"]');
  const keyWordSearchAny = block.querySelector('[name="Features"] .filter-radiobutton input[name="matchTagsAny"]');
  const keyWordSearchAll = block.querySelector('[name="Features"] .filter-radiobutton input[name="matchTagsAll"]');
  // events for filters with type toggle
  block.querySelectorAll('.filter-toggle').forEach((el) => {
    el.addEventListener('click', () => {
      toggleFilter(el);
      if (el.classList.contains('for-rent') || el.classList.contains('pending')) {
        updateFilters(el);
      }
    });
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
    let value;
    el.addEventListener('click', () => {
      el.classList.toggle('selected');
      value = el.getAttribute('value');
      // eslint-disable-next-line no-unused-expressions
      el.classList.contains('selected') ? setFilterValue('PropertyType', value) : removeFilterValue('PropertyType', value);
    });
  });

  openHousesCheckbox.addEventListener('change', () => {
    openHousesFilter.classList.toggle('selected');
    if (!openHousesCheckbox.checked) {
      removeFilterValue('OpenHouses');
    }
  });
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
  block.querySelectorAll('#container-tags .close').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.target.parentNode.remove();
    });
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
  // add key words to search
  block.querySelector('[name="Features"] .btn').addEventListener('click', () => {
    const keyword = block.querySelector('[name="Features"] input[type="text"]').value;
    if (keyword) {
      buildKeywordEl(keyword, removeFilterValue);
      setFilterValue('Features', keyword.trim());
    }
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

addEventListeners();
