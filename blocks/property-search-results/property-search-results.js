import {
  a, div, input, label, li, option, p, select, span, ul, img, domEl,
} from '../../scripts/dom-helpers.js';
import Search, {
  UPDATE_SEARCH_EVENT,
  SEARCH_URL,
  STORAGE_KEY,
} from '../../scripts/apis/creg/search/Search.js';
import ListingType from '../../scripts/apis/creg/search/types/ListingType.js';
import { propertySearch } from '../../scripts/apis/creg/creg.js';
import { getMetadata, readBlockConfig } from '../../scripts/aem.js';
import { updateForm } from '../property-search-bar/delayed.js';
import { BREAKPOINTS } from '../../scripts/scripts.js';
import observe from './observers.js';
import loader from './loader.js';
import { displayResults as displayList } from './results.js';
import { displayResults as displayMap, reinitMap } from './map.js';

let searchController;

let initMap;

/**
 * Converts the Disclaimer returned from search results and extracts images and text.
 * @param {String} disclaimer
 */
function sanitizeDisclaimer(disclaimer) {
  const tmp = document.createElement('div');
  tmp.innerHTML = disclaimer;
  const content = [];
  tmp.querySelectorAll(':scope > div').forEach((d) => {
    const text = [];
    let image;
    let imgFirst = false;
    // eslint-disable-next-line no-bitwise
    const walker = document.createTreeWalker(d, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let next = walker.firstChild();
    while (next) {
      if (next.nodeType === Node.TEXT_NODE && next.textContent.trim() !== '') {
        text.push(p(next.textContent));
      } else if (next.nodeName === 'IMG') {
        if (text.length === 0) imgFirst = true;
        const config = { src: next.src };
        if (next.height) config.height = next.height;
        if (next.width) config.width = next.width;
        image = p({ class: `image ${imgFirst ? 'img-first' : ''}` }, img(config));
      }
      next = walker.nextNode();
    }
    if (image) {
      if (imgFirst) {
        text.unshift(image);
      } else {
        text.push(image);
      }
    }
    content.push(div(...text));
  });
  return content;
}

function updateFilters(search) {
  const filters = document.querySelector('.property-search-results.block .property-search-filters');
  filters.querySelectorAll('.listing-types .filter-toggle.disabled').forEach((t) => t.classList.remove('disabled'));
  filters.querySelectorAll('.listing-types .filter-toggle input[type="checkbox"]').forEach((c) => {
    c.removeAttribute('checked');
    c.nextElementSibling.classList.remove('checked');
  });
  search.listingTypes.forEach((t) => {
    const chkbx = filters.querySelector(`.listing-types .filter-toggle input[name="${t.type}"]`);
    chkbx.setAttribute('checked', 'checked');
    chkbx.nextElementSibling.classList.add('checked');
    if (t.type === ListingType.FOR_RENT.type) {
      filters.querySelector(`.listing-types .filter-toggle input[name="${ListingType.PENDING.type}"]`).closest('.filter-toggle').classList.add('disabled');
    } else if (t.type === ListingType.PENDING.type) {
      filters.querySelector(`.listing-types .filter-toggle input[name="${ListingType.FOR_RENT.type}"]`).closest('.filter-toggle').classList.add('disabled');
    }
  });

  const sort = `${search.sortBy}_${search.sortDirection}`;
  filters.querySelector('.sort-options ul li.selected').classList.remove('selected');
  filters.querySelector(`.sort-options select option[value="${sort}"]`).selected = true;
  filters.querySelector(`.sort-options ul li[data-value="${sort}"]`).classList.add('selected');
  filters.querySelector('.selected span').textContent = filters.querySelector('.sort-options ul li.selected').textContent;
}

/**
 * Perform the search
 * @param {Search} search the search to perform
 * @param {boolean} redraw if the map should be updated
 * @return {Promise<void>}
 */
async function doSearch(search, redraw = true) {
  searchController?.abort();
  searchController = new AbortController();
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(search));
  search.franchiseeCode = getMetadata('office-id');
  const contentWrapper = document.querySelector('.property-search-results.block .search-results-content');
  contentWrapper.classList.add('loading');
  contentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
  const parent = document.querySelector('.property-search-results.block .search-results-wrapper');
  return new Promise(() => {
    const controller = searchController;
    propertySearch(search).then((results) => {
      if (!controller.signal.aborted) {
        displayList(parent, results);
        contentWrapper.querySelector('.search-results-disclaimer-wrapper').replaceChildren(
          domEl('hr', { role: 'presentation', 'aria-hidden': true, tabindex: -1 }),
          div({ class: 'search-results-disclaimer' }, ...sanitizeDisclaimer(results.disclaimer)),
        );
        contentWrapper.classList.remove('loading');
        if (redraw) displayMap(results);
      }
    });
  });
}

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const view = BREAKPOINTS.medium.matches ? 'map-view' : 'list-view';
  block.classList.add(view);
  /* @formatter:off */
  const filters = div({ class: 'property-search-filters' },
    div({ class: 'listing-types' },
      div({ class: 'filter-toggle' },
        input({
          name: 'FOR_SALE',
          hidden: 'hidden',
          type: 'checkbox',
          'aria-label': 'Hidden Checkbox',
          checked: 'checked',
          value: `${ListingType.FOR_SALE.type}`,
        }),
        div({ class: 'checkbox checked' }),
        label({ role: 'presentation' }, ListingType.FOR_SALE.label),
      ),
      div({ class: 'filter-toggle' },
        input({
          name: 'FOR_RENT',
          hidden: 'hidden',
          type: 'checkbox',
          'aria-label': 'Hidden Checkbox',
          value: `${ListingType.FOR_RENT.type}`,
        }),
        div({ class: 'checkbox' }),
        label({ role: 'presentation' }, ListingType.FOR_RENT.label),
      ),
      div({ class: 'filter-toggle' },
        input({
          name: 'PENDING',
          hidden: 'hidden',
          type: 'checkbox',
          'aria-label': 'Hidden Checkbox',
          value: `${ListingType.PENDING.type}`,
        }),
        div({ class: 'checkbox' }),
        label({ role: 'presentation' }, ListingType.PENDING.label),
      ),
      div({ class: 'filter-toggle' },
        input({
          name: 'RECENTLY_SOLD',
          hidden: 'hidden',
          type: 'checkbox',
          'aria-label': 'Hidden Checkbox',
          value: `${ListingType.RECENTLY_SOLD.type}`,
        }),
        div({ class: 'checkbox' }),
        label({ role: 'presentation' }, 'Sold'),
      ),
    ),
    div({ class: 'sort-options' },
      label({ role: 'presentation' }, 'Sort by'),
      div({ class: 'select-wrapper' },
        select({ name: 'sort', 'aria-label': 'Distance' },
          // eslint-disable-next-line object-curly-newline
          option({ value: 'DISTANCE_ASC', 'data-sort-by': 'DISTANCE', 'data-sort-direction': 'ASC', selected: 'selected' }, 'Distance'),
          option({ value: 'PRICE_DESC', 'data-sort-by': 'PRICE', 'data-sort-direction': 'DESC' }, 'Price (Hi-Lo)'),
          option({ value: 'PRICE_ASC', 'data-sort-by': 'PRICE', 'data-sort-direction': 'ASC' }, 'Price (Lo-Hi)'),
          option({ value: 'DATE_DESC', 'data-sort-by': 'DATE', 'data-sort-direction': 'DESC' }, 'Date (New-Old)'),
          option({ value: 'DATE_ASC', 'data-sort-by': 'DATE', 'data-sort-direction': 'ASC' }, 'Date (Old-New)'),
        ),
        // eslint-disable-next-line object-curly-newline
        div({ class: 'selected', role: 'combobox', 'aria-haspopup': 'listbox', 'aria-label': 'Distance', 'aria-expanded': false, 'aria-controls': 'search-results-sort', tabindex: 0 },
          span('Distance'),
        ),
        ul({ id: 'search-results-sort', class: 'select-items', role: 'listbox' },
          li({ 'data-value': 'DISTANCE_ASC', role: 'option', class: 'selected' }, 'Distance'),
          li({ 'data-value': 'PRICE_DESC', role: 'option' }, 'Price (Hi-Lo)'),
          li({ 'data-value': 'PRICE_ASC', role: 'option' }, 'Price (Lo-Hi)'),
          li({ 'data-value': 'DATE_DESC', role: 'option' }, 'Date (New-Old)'),
          li({ 'data-value': 'DATE_ASC', role: 'option' }, 'Date (Old-New)'),
        ),
      ),
    ),
    div({ class: 'desktop-view-options view-options' },
      p({ class: 'button-container' },
        a({ class: 'map-view', role: 'button', rel: 'noopener noreferrer' }, 'Map View'),
        a({ class: 'list-view', role: 'button', rel: 'noopener noreferrer' }, 'List View'),
      ),
    ),
  );

  const map = div({ class: 'search-map-wrapper' },
    div({ class: 'search-map-container satellite' },
      div({ class: 'search-results-map' }, div({ id: 'gmap-canvas' })),
    ),
  );
  /* @formatter:on */

  const list = div({ class: 'search-results-wrapper' });
  const disclaimer = div({ class: 'search-results-disclaimer-wrapper' });

  const content = div({ class: 'search-results-content loading' }, loader, list, disclaimer);

  const buttons = div({ class: 'mobile-view-options view-options' },
    p({ class: 'button-container' },
      a({ target: '_blank', role: 'button', rel: 'noopener noreferrer' }, 'Save'),
      a({ class: 'map-view', role: 'button', rel: 'noopener noreferrer' }, 'Map View'),
      a({ class: 'list-view', role: 'button', rel: 'noopener noreferrer' }, 'List View'),
    ),
  );

  block.replaceChildren(filters, map, content, buttons);

  // Default the search results.
  let search;
  if (window.location.search === '') {
    const data = window.sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      search = await Search.fromJSON(JSON.parse(data));
    } else {
      search = await Search.fromBlockConfig(config);
    }
    window.history.replaceState(null, '', new URL(`/search?${search.asURLSearchParameters()}`, window.location));
  } else {
    search = await Search.fromQueryString(window.location.search);
  }
  updateFilters(search);
  updateForm(search);
  observe(block);

  window.addEventListener('popstate', async () => {
    const newSearch = await Search.fromQueryString(window.location.search);
    updateFilters(newSearch);
    updateForm(newSearch);
    reinitMap(newSearch);
    doSearch(newSearch);
  });

  window.addEventListener(UPDATE_SEARCH_EVENT, async (e) => {
    const { search: newSearch, redraw } = e.detail;
    updateFilters(newSearch);
    window.history.pushState(null, '', new URL(`${SEARCH_URL}?${newSearch.asURLSearchParameters().toString()}`, window.location));
    doSearch(newSearch, redraw);
  });

  window.setTimeout(async () => {
    const mod = await import(`${window.hlx.codeBasePath}/blocks/property-search-results/map.js`);
    initMap = mod.initMap;
    initMap(block, search);
    doSearch(search);
  }, 3000);
}
