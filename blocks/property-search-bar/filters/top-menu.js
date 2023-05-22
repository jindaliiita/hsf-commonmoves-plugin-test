import {
  getPlaceholder,
  addRangeOption,
  addOptions,
  TOP_LEVEL_FILTERS,
  getConfig,
  processSearchType,
  getFilterLabel,
} from '../common-function.js';

function observeFilters() {
  const script = document.createElement('script');
  script.id = crypto.randomUUID();
  script.type = 'text/partytown';
  script.innerHTML = `
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '${window.hlx.codeBasePath}/blocks/property-search-bar/filters/top-delayed.js';
    document.head.append(script);
  `;
  document.head.append(script);
}

function buildTotalResults() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('total-results');
  wrapper.innerHTML = '<div role="heading" aria-level="1"/>';
  return wrapper;
}

function buildMapToggle() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('map-toggle', 'flex-row', 'center');
  wrapper.innerHTML = `
            <a rel="noopener" target="_blank" tabindex="" class="btn btn-map-toggle" role="button">
            <span class="text-up">
            map view
        </span></a>`;
  return wrapper;
}

function buildButton(label, primary = false) {
  const button = document.createElement('div');
  button.classList.add('button-container');
  button.innerHTML = `
    <a target="_blank" tabindex="" class="btn center ${primary ? 'btn-primary' : 'btn-secondary'}" role="button">
            <span>${label}</span>
    </a>`;
  return button;
}

function buildFilterToggle() {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('name', 'AdditionalFilters');
  wrapper.classList.add('filter-container', 'flex-row', 'center', 'bl');
  wrapper.innerHTML = `
            <a role="button" aria-label="Filter">
                <svg role="presentation">
                    <use xlink:href="/icons/icons.svg#filter-white"></use>
                </svg>
                <svg role="presentation" class="hide">
                <use xlink:href="/icons/icons.svg#close-x-white"></use></svg>
            </a>`;
  return wrapper;
}

function buildSortByEl() {
  const filterName = 'Sort';
  const label = getFilterLabel(filterName);
  const defaultValue = 'Price (Hi-Lo)';
  const options = addOptions(filterName, defaultValue, 'multi', filterName);
  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('flex-row', 'multiple-inputs', 'filter');
  dropdownContainer.setAttribute('name', filterName);
  dropdownContainer.innerHTML = `<div class="header">
             <div class="title mr-1"><span>${label}</span></div>
             </div>
       <div class="search-results-dropdown">${options}</div>`;
  dropdownContainer.querySelector('.select-selected').classList.add('text-up');
  dropdownContainer.querySelectorAll('.select-item li').forEach((el) => {
    el.classList.add('text-up');
    if (el.getAttribute('data-value') === '') {
      el.remove();
    }
    if (el.innerText === defaultValue) {
      el.classList.add('highlighted');
    }
  });
  return dropdownContainer;
}

function buildTopFilterPlaceholder(filterName) {
  const dropdownContainer = document.createElement('div');
  const { type } = TOP_LEVEL_FILTERS[filterName];
  let label = getFilterLabel(filterName);
  let options = addRangeOption(filterName);
  if (type === 'select') {
    options = addOptions(filterName, `Any ${label}`);
    label = `Any ${label}`;
  }
  dropdownContainer.classList.add('bl', 'container-item');
  dropdownContainer.setAttribute('name', filterName);
  dropdownContainer.innerHTML = `<div class="header">
             <div class="title text-up"><span>${label}</span></div>
             </div>
       <div class="search-results-dropdown input hide shadow">${options}</div>`;

  return dropdownContainer;
}
function buildFilterSearchTypesElement() {
  const wrapper = document.createElement('div');
  let el;
  wrapper.classList.add('filter', 'flex-row', 'center', 'top-menu');
  wrapper.setAttribute('name', 'ApplicationType');
  getConfig('ApplicationType').forEach((value) => {
    el = processSearchType(value);
    el.classList.add('center', 'ml-1');
    el.querySelector('label').classList.add('fs-xs');
    wrapper.append(el);
  });
  return wrapper;
}

async function build() {
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  const div = document.createElement('div');
  const bfContainer = document.createElement('div');
  const bfRightSection = document.createElement('div');
  const filterContainer = document.createElement('div');
  filterContainer.classList.add('result-filters', 'flex-row');
  bfRightSection.classList.add('flex-row', 'space-between');
  bfContainer.classList.add('bf-container');
  container.classList.add('search-listing-container', 'flex-row');
  wrapper.classList.add('search-listing-block');

  const primaryFilters = document.createElement('div');
  primaryFilters.classList.add('primary-search', 'flex-row');
  primaryFilters.innerHTML = `    <div class="search-bar search-bar" role="search">
      <div class="search-suggester suggester-input">
          <input type="text" placeholder="${getPlaceholder('US')}" aria-label="${getPlaceholder('US')}" name="keyword">
          <input type="hidden" name="query">
          <input type="hidden" name="type">
          <ul class="suggester-results">
            <li class="list-title">Please enter at least 3 characters.</li>
          </ul>
        </div>
      </div>`;
  wrapper.prepend(primaryFilters, buildButton('Search', true));
  Object.keys(TOP_LEVEL_FILTERS).forEach((filter) => {
    const filterElement = buildTopFilterPlaceholder(filter);
    wrapper.append(filterElement);
  });
  wrapper.append(buildFilterToggle(), buildButton('save search', true));
  div.append(wrapper);
  bfRightSection.append(buildSortByEl(), buildMapToggle());
  bfContainer.append(buildFilterSearchTypesElement(), bfRightSection);
  filterContainer.append(buildTotalResults(), bfContainer);
  container.append(div, filterContainer);
  observeFilters();
  return container;
}

const topMenu = {
  build,
};

export default topMenu;
