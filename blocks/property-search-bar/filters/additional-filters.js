import {
  addRangeOption, EXTRA_FILTERS, formatInput, TOP_LEVEL_FILTERS,
  getConfig, buildFilterSearchTypesElement, getFilterLabel,
} from '../common-function.js';

const SEARCH_TYPES = { ApplicationType: { label: 'Search Types', type: 'search-types' } };
const FILTERS = { ...SEARCH_TYPES, ...TOP_LEVEL_FILTERS, ...EXTRA_FILTERS };

function observeFilters() {
  const script = document.createElement('script');
  script.id = crypto.randomUUID();
  script.type = 'text/partytown';
  script.innerHTML = `
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '${window.hlx.codeBasePath}/blocks/property-search-bar/filters/additional-params-delayed.js';
    document.head.append(script);
  `;
  document.head.append(script);
}

function buildPropertyColumn(labels = {}) {
  let output = '';
  Object.keys(labels).forEach((name) => {
    output += `<button type="button" class="flex-row" value=${name}>
                <svg role="presentation">
                    <use xlink:href="/icons/icons.svg#${formatInput(labels[name])}"></use>
                </svg>
                <span class="ml-1">${labels[name]}</span>
            </button>`;
  });
  return output;
}

function buildCheckBox(ariaLabel, label = '') {
  return `<div class=" filter-checkbox mt-1">
        <label role="presentation" class="flex-row mb-1">
            <input type="checkbox" aria-label="${ariaLabel}">
            <div class="checkbox">
                <svg role="presentation">
                    <use xlink:href="/icons/icons.svg#checkmark"></use>
                </svg>
            </div>
            <span class="label">${label}</span>
        </label>
    </div>`;
}

function buildPropertyFilterHtml(label) {
  const firstColumnValues = { 1: 'Condo/Townhouse', 3: 'Commercial', 5: 'Lot/Land' };
  const secondColumnValues = { 2: 'Single Family', 4: 'Multi Family', 6: 'Farm/Ranch' };
  return `
    <div class="column-2 flex-row">
    <div class="column">${buildPropertyColumn(firstColumnValues)}</div>
    <div class="column">${buildPropertyColumn(secondColumnValues)}</div>
    </div>
    ${buildCheckBox(label, 'Select All')}
`;
}

function buildFilterOpenHouses() {
  return `
    <div class="flex-row vertical-center">
    ${buildCheckBox('Open Houses Only')}
        <div class="ml-1 mr-1">
            <label role="presentation" class="flex-row center">
                <input type="radio" name="openHousesOnlyWeekend" value="false">
            <div class="radio-btn"></div>
            <span class="">This Weekend</span>
            </label>
        </div>
        <div>
            <label role="presentation" class="flex-row vertical-center">
            <input type="radio" name="openHousesOnlyAnytime" value="false">
            <div class="radio-btn"></div>
            <span class="">Anytime</span>
            </label>
        </div>
    </div>
`;
}
function buildKeywordSearch() {
  return `
    <div class="flex-row vertical-center container-input">
            <input type="text" placeholder="Pool, Offices, Fireplace..." aria-label="Pool, Offices, Fireplace...">
            <button type="submit" class="btn secondary center">
                <span class="text-up">add</span>
            </button>
    </div>
    <div id="container-tags" class="mt-1"></div>
       <br>
        <div class="flex-row vertical-center">
            <label class="text-up vertical-center" role="presentation">match</label>
            <div class="filter-radiobutton">
                <label role="presentation" class="flex-row vertical-center ml-1 mr-1">
                    <input type="radio" name="matchTagsAny" value="false">
                    <div class="radio-btn"></div>
                    <span class="fs-1">Any</span>
                </label>
            </div>
            <div class="filter-radiobutton">
                <label role="presentation" class="flex-row vertical-center">
                    <input type="radio" name="matchTagsAll" value="true">
                    <div class="radio-btn"></div>
                    <span class="fs-1">All</span>
                </label>
            </div>
        </div>
</div>`;
}

function buildFilterToggle() {
  return `
    <div>
       <div class="filter-toggle">
           <input hidden="hidden" type="checkbox" aria-label="Hidden checkbox" value="true">
           <div class="checkbox"></div>
       </div>
    </div>`;
}

function buildSectionFilter(filterName) {
  const number = getConfig(filterName);
  const defaultValue = 'Any';
  const name = filterName.toLowerCase();
  let output = `
    <ul class="flex-row tile">
    <li>
            <input aria-describedby="${name}${defaultValue}" type="radio" id="${name}${defaultValue}" value=${defaultValue}>
            <label for="${name}${defaultValue}">${defaultValue}</label>
    </li>`;

  for (let i = 1; i <= number; i += 1) {
    output += `<li>
            <input aria-describedby="${name}${i}" type="radio" id="${name}${i}" value=${i}>
            <label for="${name}${i}">${`${i}+`}</label>
        </li>`;
  }

  output += '</ul>';
  return output;
}

function getOptions(name) {
  let options = '';
  const { type } = FILTERS[name];
  switch (type) {
    case 'select':
      options = buildSectionFilter(name);
      break;
    case 'range':
      options = addRangeOption(name);
      break;
    case 'toggle':
      options = buildFilterToggle();
      break;
    case 'keywords-search':
      options = buildKeywordSearch();
      break;
    case 'open-houses':
      options = buildFilterOpenHouses();
      break;
    case 'property':
      options = buildPropertyFilterHtml();
      break;
    case 'search-types':
      options = buildFilterSearchTypesElement();
      break;
    default:
      break;
  }
  return options;
}

function buildPlaceholder(filterName) {
  const { type } = FILTERS[filterName];
  if (type === 'child') {
    return '';
  }
  const placeholder = document.createElement('div');
  const label = getFilterLabel(filterName);
  const options = getOptions(filterName);
  placeholder.setAttribute('name', filterName);
  placeholder.classList.add('filter');
  placeholder.innerHTML = ` <label class="section-label text-up">${label}</label>
  ${options}`;
  return placeholder.outerHTML;
}

async function build() {
  const wrapper = document.createElement('div');
  let output = '';
  Object.keys(FILTERS).forEach((filter) => { output += buildPlaceholder(filter); });
  wrapper.classList.add('filter-block', 'hide', 'input');
  wrapper.innerHTML = ` 
    ${output}`;
  observeFilters();
  return wrapper;
}

const additionalFilters = {
  build,
};

export default additionalFilters;
