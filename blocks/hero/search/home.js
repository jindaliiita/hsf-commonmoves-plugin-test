import { decorateIcons } from '../../../scripts/aem.js';
import {
  build as buildCountrySelect,
} from '../../shared/search-countries/search-countries.js';

function observeForm() {
  const script = document.createElement('script');
  script.type = 'text/partytown';
  script.innerHTML = `
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '${window.hlx.codeBasePath}/blocks/hero/search/home-delayed.js';
    document.head.append(script);
  `;
  document.head.append(script);
}

/**
 * Creates a Select dropdown for filtering search.
 * @param {String} name
 * @param {String} placeholder
 * @param {number} number
 * @returns {HTMLDivElement}
 */
function buildSelect(name, placeholder, number) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('select-wrapper');
  wrapper.innerHTML = `
    <select name="${name}" aria-label="${placeholder}">
      <option value="">Bedrooms</option>
    </select>
    <div class="selected" role="button" aria-haspopup="listbox" aria-label="${placeholder}">${placeholder}</div>
    <ul class="select-items" role="listbox">
      <li role="option">${placeholder}</li>
    </ul>
  `;

  const select = wrapper.querySelector('select');
  const ul = wrapper.querySelector('ul');
  for (let i = 1; i <= number; i += 1) {
    const option = document.createElement('option');
    const li = document.createElement('li');
    li.setAttribute('role', 'option');

    option.value = `${i}`;
    // eslint-disable-next-line no-multi-assign
    option.textContent = li.textContent = `${i}+`;
    select.append(option);
    ul.append(li);
  }
  return wrapper;
}

function getPlaceholder(country) {
  if (country && country !== 'US') {
    return 'Enter City';
  }
  return 'Enter City, Address, Zip/Postal Code, Neighborhood, School or MLS#';
}

async function buildForm() {
  const form = document.createElement('form');
  form.classList.add('homes');
  form.setAttribute('action', '/search');

  form.innerHTML = `
    <div class="mobile-header">
      <div class="logo">
        <img alt="Logo" src="/styles/images/logo-black.svg" />
      </div>
      <button class="close" aria-label="Close" type="button">
        <svg role="presentation" aria-hidden="true" tabindex="-1">
          <use xlink:href="/icons/icons.svg#close-x"></use>
        </svg>
      </button>
    </div>
    <div class="search-bar" role="search">
      <div class="search-suggester">
        <div class="suggester-input">
          <input type="text" placeholder="${getPlaceholder()}" aria-label="${getPlaceholder()}" name="keyword">
          <input type="hidden" name="query">
          <input type="hidden" name="type">
          <ul class="suggester-results">
            <li class="list-title">Please enter at least 3 characters.</li>
          </ul>
        </div>
      </div>
      <button class="filter" type="button" aria-label="More Filters" aria-haspopup="true">
        <span class="icon icon-filter"></span>
      </button>
      <button class="search-submit" aria-label="Search Homes" type="submit">
        <span>Search</span>
      </button>
    </div>
    <div class="filters">
      <input type="text" placeholder="$ Minimum Price" name="MinPrice" aria-label="minimum price">
      <input type="text" placeholder="$ Maximum Price" name="MaxPrice" aria-label="maximum price">
      ${buildSelect('MinBedroomsTotal', 'Bedrooms', 12).outerHTML}
      ${buildSelect('MinBathroomsTotal', 'Bathrooms', 8).outerHTML}
       <button class="close" aria-label="Close" type="button">
         <svg role="presentation" aria-hidden="true">
          <use xlink:href="/icons/icons.svg#close-x"></use>
        </svg>
      </button>
    </div>
    <button class="submit" type="submit">Search</button>
`;

  const changeCountry = (country) => {
    const placeholder = getPlaceholder(country);
    const input = form.querySelector('.suggester-input input');
    input.setAttribute('placeholder', placeholder);
    input.setAttribute('aria-label', placeholder);
  };

  const countrySelect = await buildCountrySelect(changeCountry);
  if (countrySelect) {
    form.querySelector('.search-suggester').prepend(countrySelect);
  }
  decorateIcons(form);
  observeForm();
  return form;
}

const homes = {
  buildForm,
};

export default homes;
