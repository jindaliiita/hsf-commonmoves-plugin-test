import {
  getPlaceholder,
  addRangeOption,
  addOptions,
  TOP_LEVEL_FILTERS,
  getConfig,
  processSearchType,
  getFilterLabel,
} from './common-function.js';

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
       <div class="search-results-dropdown hide shadow">${options}</div>`;

  return dropdownContainer;
}
export function buildFilterSearchTypesElement() {
  const wrapper = document.createElement('div');
  let el;
  wrapper.classList.add('filter', 'flex-row', 'center');
  wrapper.setAttribute('name', 'ApplicationType');
  getConfig('ApplicationType').forEach((value) => {
    el = processSearchType(value);
    el.classList.add('center', 'ml-1');
    el.querySelector('label').classList.add('fs-xs');
    wrapper.append(el);
  });
  return wrapper;
}

export function build() {
  const defaultSuggestionMessage = 'Please enter at least 3 characters.';
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  const div = document.createElement('div');
  const bfContainer = document.createElement('div');
  bfContainer.classList.add('flex-row', 'space-between');
  container.classList.add('search-listing-container', 'flex-row');
  wrapper.classList.add('search-listing-block');

  const primaryFilters = document.createElement('div');
  primaryFilters.classList.add('primary-search', 'flex-row');
  primaryFilters.innerHTML = ` <div class="input-container">
                <input type="text" placeholder="${getPlaceholder('US')}" aria-label="${getPlaceholder('US')}" class="search-suggester">
                <div tabindex="0" class="search-suggester-results hide">
                    <ul>
                        <li class="search-suggester-results">${defaultSuggestionMessage}</li>
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
  bfContainer.append(buildFilterSearchTypesElement(), buildSortByEl());
  container.append(div, bfContainer);
  return container;
}
