import {
  build as buildCountrySelect,
} from '../../shared/search-countries/search-countries.js';
import { getMetadata, loadScript } from '../../../scripts/aem.js';
import { getSpinner } from '../../../scripts/util.js';
import { BED_BATHS, buildFilterSelect, getPlaceholder } from '../../shared/search/util.js';
import Search, { SEARCH_URL } from '../../../scripts/apis/creg/search/Search.js';
import { metadataSearch } from '../../../scripts/apis/creg/creg.js';

async function observeForm(e) {
  const form = e.target.closest('form');
  try {
    const mod = await import(`${window.hlx.codeBasePath}/blocks/shared/search/suggestion.js`);
    mod.default(form);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('failed to load suggestion library', error);
  }
  e.target.removeEventListener('focus', observeForm);
}

async function submitForm(e) {
  e.preventDefault();
  e.stopPropagation();

  const spinner = getSpinner();
  const form = e.currentTarget.closest('form');
  form.prepend(spinner);

  const type = form.querySelector('input[name="type"]');

  let search = new Search();
  if (type && type.value) {
    try {
      const mod = await import(`${window.hlx.codeBasePath}/scripts/apis/creg/search/types/${type.value}Search.js`);
      if (mod.default) {
        // eslint-disable-next-line new-cap
        search = new mod.default();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load Search Type for ${type.value}`, error);
    }
  }
  search.populateFromSuggestion(new URLSearchParams(form.querySelector('input[name="query"]').value));
  search.input = form.querySelector('input[name="keyword"]').value;

  search.minPrice = form.querySelector('input[name="minPrice"]').value;
  search.maxPrice = form.querySelector('input[name="maxPrice"]').value;
  search.minBedrooms = form.querySelector('select[name="bedrooms"]').value;
  search.minBathrooms = form.querySelector('select[name="bathrooms"]').value;

  const franchisee = getMetadata('office-id');
  if (franchisee) {
    search.franchisee = franchisee;
  }
  metadataSearch(search).then((results) => {
    if (results) {
      let url = '';
      if (window.location.href.includes('localhost')) {
        url += `/search?${search.asURLSearchParameters()}`;
      } else if (results.vanityDomain) {
        if (getMetadata('vanity-domain') === results.vanityDomain) {
          url += `/search?${search.asURLSearchParameters()}`;
        } else {
          url += `${results.vanityDomain}/search?${search.asCregURLSearchParameters()}`;
        }
      } else {
        url = `https://www.bhhs.com${results.searchPath}/search?${search.asCregURLSearchParameters()}`;
      }
      window.location = url;
    }
    spinner.remove();
  });
}

async function buildForm() {
  const form = document.createElement('form');
  form.classList.add('homes');
  form.setAttribute('action', SEARCH_URL);

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
        <div class="search-country-select-parent"></div>
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
        <svg>
          <use xlink:href="/icons/icons.svg#search-filter"></use>
        </svg>
      </button>
      <button class="close" aria-label="Close" type="button">
        <svg role="presentation" aria-hidden="true">
          <use xlink:href="/icons/icons.svg#close-x"></use>
        </svg>
      </button>
      <button class="search-submit" aria-label="Search Homes" type="submit">
        <span>Search</span>
      </button>
    </div>
    <div class="filters">
      <input type="text" placeholder="$ Minimum Price" name="MinPrice" aria-label="minimum price">
      <input type="text" placeholder="$ Maximum Price" name="MaxPrice" aria-label="maximum price">
      ${buildFilterSelect('MinBedroomsTotal', 'Bedrooms', BED_BATHS).outerHTML}
      ${buildFilterSelect('MinBathroomsTotal', 'Bathrooms', BED_BATHS).outerHTML}
    </div>
    <button class="submit" type="submit">Search</button>
  `;

  const input = form.querySelector('.suggester-input input');

  const changeCountry = (country) => {
    const placeholder = getPlaceholder(country);
    input.setAttribute('placeholder', placeholder);
    input.setAttribute('aria-label', placeholder);
  };

  buildCountrySelect(changeCountry).then((select) => {
    if (select) {
      form.querySelector('.search-country-select-parent').append(select);
    }
  });

  window.setTimeout(() => {
    loadScript(`${window.hlx.codeBasePath}/blocks/hero/search/home/filters.js`, { type: 'module' });
  }, 3000);
  input.addEventListener('focus', observeForm);

  form.querySelectorAll('button[type="submit"]').forEach((button) => {
    button.addEventListener('click', submitForm);
  });

  return form;
}

const homes = {
  buildForm,
};

export default homes;
