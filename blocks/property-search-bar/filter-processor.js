import {
  setParam, getParam, removeParam, getSearchObject, buildUrl,
} from '../../scripts/search.js';
import {
  buildKeywordEl, formatPriceLabel,
  TOP_LEVEL_FILTERS, EXTRA_FILTERS, BOTTOM_LEVEL_FILTERS, getConfig, toggleOverlay,
} from './common-function.js';

import {
  propertySearch,
  SearchParameters,
} from '../../scripts/apis/creg/creg.js';
import { getSpinner } from '../../scripts/util.js';

import { setPropertyDetails as setResults } from '../../scripts/search/results.js';

export function searchProperty() {
  const spinner = getSpinner();
  const overlay = document.querySelector('.overlay');
  toggleOverlay();
  overlay.prepend(spinner);
  const type = getParam('SearchType');
  const input = '';
  const searchParams = getSearchObject();
  if (Object.prototype.hasOwnProperty.call(searchParams, 'SearchType')) {
    delete searchParams.SearchType;
  }
  const params = new SearchParameters(type, input, searchParams);
  propertySearch(params).then((results) => {
    if (!results?.properties) {
      results.properties = [];
    }
    const output = JSON.stringify(results.properties);
    setResults(output);
    spinner.remove();
    toggleOverlay();
  });

  // update url
  const nextUrl = buildUrl();
  const nextTitle = 'Property Search Results Commonwealth Real Estate | Berkshire Hathaway HomeServices';
  const nextState = { additionalInformation: 'Updated the URL with JS' };
  window.history.replaceState(nextState, nextTitle, nextUrl);
}
/**
 *
 * @param filterName
 * @param value
 * @returns {string|string|*}
 */
export function formatValue(filterName, value) {
  let conf; let
    formattedValue = '';
  switch (filterName) {
    case 'Price':
      formattedValue = formatPriceLabel(value.min, value.max);
      break;
    case 'MinBedroomsTotal':
      formattedValue = value ? `${value}+ Beds` : 'Any Beds';
      break;
    case 'MinBathroomsTotal':
      formattedValue = value ? `${value}+ Baths` : 'Any Baths';
      break;
    case 'LivingArea':
      formattedValue = `${value.min}Sq Ft-${value.max} Sq Ft`;
      if (value.min === '') {
        formattedValue = `no min- ${value.max} Sq Ft`;
      }
      if (value.max === '') {
        formattedValue = `${value.min} Sq Ft - no max`;
      }
      if (value.min === '' && value.max === '') {
        formattedValue = 'square feet';
      }
      break;
    case 'Sort':
      conf = getConfig(filterName);
      for (let i = 0; i < conf.length; i += 1) {
        if (conf[i].value === value) {
          formattedValue = conf[i].label;
        }
      }
      break;
    default:
      formattedValue = value;
  }
  return formattedValue;
}

/**
 * Get filter value
 * @param {string} filterName
 * @returns {string}
 *
 */
export function getValueFromStorage(filterName) {
  let minValue = '';
  let maxValue = '';
  let value = '';
  switch (filterName) {
    case 'Price':
    case 'LivingArea':
      value = { min: getParam(`Min${filterName}`) ?? '', max: getParam(`Max${filterName}`) ?? '' };
      break;
    case 'Features':
    case 'ApplicationType':
    case 'PropertyType':
      value = getParam(filterName) ? getParam(filterName).split(',') : [];
      break;
    case 'YearBuilt':
      [minValue, maxValue] = (getParam('YearBuilt') || '-').split('-').map((val) => {
        if (val === '1899') return 'No Min';
        if (val === '2100') return 'No Max';
        return val;
      });
      value = { min: minValue, max: maxValue };
      break;
    case 'FeaturedCompany':
      value = getParam('FeaturedCompany') === 'BHHS';
      break;
    default:
      value = getParam(filterName) ?? false;
  }
  return value;
}

export function removeFilterValue(name, value = '') {
  let params;
  let paramsToArray;
  switch (name) {
    case 'Features':
      params = getParam('Features') ?? '';
      paramsToArray = params.split(',');
      paramsToArray = paramsToArray.filter((i) => i !== value);
      params = paramsToArray.join(',');
      setParam('Features', params);
      break;
    default:
      removeParam(name);
  }
}
/**
 *
 * @param {string} name
 * @param {string|obj} value
 */
export function setFilterValue(name, value) {
  let params;
  switch (name) {
    case 'FeaturedCompany':
      // eslint-disable-next-line no-unused-expressions
      value ? setParam('FeaturedCompany', 'BHHS') : removeParam('FeaturedCompany');
      break;
    case 'Luxury':
    case 'RecentPriceChange':
      // eslint-disable-next-line no-unused-expressions
      value ? setParam(name, true) : removeParam(name);
      break;
    case 'Features':
      params = getParam(name) ?? '';
      params = params.length > 0 ? params.concat(',', value) : value;
      setParam(name, params);
      break;
    case 'MinPrice':
    case 'MaxPrice':
    case 'MinBedroomsTotal':
    case 'MinBathroomsTotal':
    case 'ApplicationType':
      // eslint-disable-next-line no-unused-expressions
      value.length > 0 ? setParam(name, value) : removeParam(name);
      break;
    default:
      setParam(name, value);
  }
}

export function setInitialValuesFromUrl() {
  const url = window.location.href;
  const queryString = url.split('?')[1];
  if (queryString) {
    queryString.split('&').forEach((query) => {
      // eslint-disable-next-line prefer-const
      let [key, value] = query.split('=');
      value = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      setFilterValue(key, value);
    });
  }
}

export function populatePreSelectedFilters(topMenu = true) {
  let filters; let
    el;
  let value = '';
  if (topMenu) {
    filters = { ...TOP_LEVEL_FILTERS, ...BOTTOM_LEVEL_FILTERS };
    Object.keys(filters).forEach((name) => {
      const selector = `[name="${name}"] .title span`;
      value = getValueFromStorage(name);
      if (Object.keys(BOTTOM_LEVEL_FILTERS).includes(name)) {
        if (name === 'ApplicationType') {
          value.forEach((key) => {
            document.querySelector(`[name="${name}"] > [name="${key}"] .checkbox`).classList.add('checked');
          });
        }
        if (name === 'Sort' && value) {
          el = document.querySelector('[name="Sort"]');
          el.querySelector('.select-selected').innerText = formatValue(name, value);
          el.querySelector('.highlighted').classList.toggle('highlighted');
          el.querySelector(`[data-value="${value}"]`).classList.toggle('highlighted');
        }
      } else {
        document.querySelector(selector).innerText = formatValue(name, value);
      }
    });
  } else {
    const storageKeyToName = { ...TOP_LEVEL_FILTERS, ...EXTRA_FILTERS, ...BOTTOM_LEVEL_FILTERS };
    Object.keys(storageKeyToName).forEach((name) => {
      value = getValueFromStorage(name);
      let min;
      let max;
      let filter;
      switch (name) {
        case 'Price':
          document.querySelector('.filter [name="MinPrice"]').value = value.min;
          document.querySelector('.filter [name="MaxPrice"]').value = value.max;
          break;
        case 'MinBedroomsTotal':
        case 'MinBathroomsTotal':
          value = value || 'Any';
          document.querySelectorAll(`[name="${name}"] input`).forEach(
            (input) => { input.checked = (input.value === value); },
          );
          break;
        case 'LivingArea':
          document.querySelector('.filter [name="MinLivingArea"]').innerText = value.min.length > 0 ? `${value.min} Sq Ft` : 'No Min';
          document.querySelector('.filter [name="MaxLivingArea"]').innerText = value.max.length > 0 ? `${value.max} Sq Ft` : 'No Max';
          document.querySelectorAll('.filter [name="MinLivingArea"] ~ul li').forEach((li) => {
            li.classList.toggle('highlighted', li.getAttribute('data-value') === value.min);
          });
          document.querySelectorAll('.filter [name="MaxLivingArea"] ~ul li').forEach((li) => {
            li.classList.toggle('highlighted', li.getAttribute('data-value') === value.max);
          });

          break;
        case 'PropertyType':
          document.querySelectorAll('.filter[name="PropertyType"] button').forEach((button) => {
            button.classList.toggle('selected', value.includes(button.value));
          });
          break;
        case 'Features':
          if (document.querySelector('#container-tags').childElementCount === 0) {
            value.forEach((key) => {
              buildKeywordEl(key, removeFilterValue);
            });
          }
          break;
        case 'YearBuilt':
          [min, max] = [value.min !== '' ? value.min : 'No Min', value.max !== '' ? value.max : 'No Max'];
          document.querySelectorAll('[name="YearBuilt"] .select-selected').forEach((elem, i) => {
            elem.innerText = i === 0 ? min : max;
          });
          break;
        case 'OpenHouses':
          filter = document.querySelector('[name="OpenHouses"]');
          filter.classList.toggle('selected', !!value);
          filter.querySelector('input[type="checkbox"]').checked = !!value;
          el = value === 7 ? filter.querySelector('[name="openHousesOnlyWeekend"]')
            : filter.querySelector('[name="openHousesOnlyAnytime"]');
          el.checked = true;
          break;
        case 'MatchAnyFeatures':
          document.querySelector('[name="matchTagsAll"]').checked = !value;
          document.querySelector('[name="matchTagsAny"]').checked = value;
          break;
        case 'ApplicationType':
          value.forEach((key) => {
            document.querySelector(`[name="${name}"] .column [name="${key}"] .checkbox`).classList.add('checked');
          });
          break;
        case 'Sort':
          // do nothing
          break;
        default:
          document.querySelector(`.filter[name="${name}"] .checkbox`).classList.toggle('checked', value);
          document.querySelector(`.filter[name="${name}"] input`).value = value;
      }
    });
  }
}
