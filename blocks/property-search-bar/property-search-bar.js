import {
  BED_BATHS,
  buildDataListRange,
  buildFilterSelect,
  buildSelectRange,
  getPlaceholder,
} from '../shared/search/util.js';
import { decorateIcons, loadScript } from '../../scripts/aem.js';

export const SQUARE_FEET = [
  { value: '500', label: '500 Sq Ft' },
  { value: '750', label: '750 Sq Ft' },
  { value: '1000', label: '1,000 Sq Ft' },
  { value: '1250', label: '1,250  Sq Ft' },
  { value: '1500', label: '1,500 Sq Ft' },
  { value: '1750', label: '1,750 Sq Ft' },
  { value: '2000', label: '2,000 Sq Ft' },
  { value: '2250', label: '2,250 Sq Ft' },
  { value: '2500', label: '2,500 Sq Ft' },
  { value: '2750', label: '2,750 Sq Ft' },
  { value: '3000', label: '3,000 Sq Ft' },
  { value: '3500', label: '3,500 Sq Ft' },
  { value: '4000', label: '4,000 Sq Ft' },
  { value: '5000', label: '5,000 Sq Ft' },
  { value: '7500', label: '7,500 Sq Ft' },
];

function buildBar() {
  const div = document.createElement('div');
  div.classList.add('search-form-wrapper');
  div.innerHTML = `
    <form action="/search"> 
      <div class="search-bar" role="search">
        <div class="search-suggester suggester-input">
          <input type="text" placeholder="${getPlaceholder()}" aria-label="${getPlaceholder()}" name="keyword">
          <input type="hidden" name="query">
          <input type="hidden" name="type">
          <ul class="suggester-results">
            <li class="list-title">Please enter at least 3 characters.</li>
          </ul>
        </div>
      </div>
      <div class="result-filters">
        ${buildDataListRange('price', 'Price').outerHTML}
        ${buildFilterSelect('bedrooms', 'Beds', BED_BATHS).outerHTML}
        ${buildFilterSelect('bathrooms', 'Baths', BED_BATHS).outerHTML}
        ${buildSelectRange('sqft', 'Square Feet', SQUARE_FEET).outerHTML}
        <a class="filter" type="button" aria-label="More Filters" aria-haspopup="true">
          <span class="icon icon-filter-white"></span>
          <span class="icon icon-close-x-white"></span>
        </a>
        <a class="save-search" type="button" aria-label="Save Search" role="button"><span>Save Search</span></a>
      </div>
      <a href="#" class="search-submit" aria-label="Search">
        <span class="icon icon-search"></span>
      </a>
      <div class="advanced-filters">
      </div>
      <div class="search-overlay"></div>
    </form>
  `;
  return div;
}

export default async function decorate(block) {
  block.replaceChildren(buildBar());
  decorateIcons(block);
  window.setTimeout(() => {
    loadScript(`${window.hlx.codeBasePath}/blocks/property-search-bar/delayed.js`, { type: 'module' });
  }, 3000);
}
