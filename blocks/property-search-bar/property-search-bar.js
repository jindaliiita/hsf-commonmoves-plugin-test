import {
  populatePreSelectedFilters, setInitialValuesFromUrl, searchProperty,
} from './filter-processor.js';

import {
  buildFilterSearchTypesElement, closeTopLevelFilters,
} from './common-function.js';
import topMenu from './filters/top-menu.js';
import additionalFilters from './filters/additional-filters.js';
import layoutButtons from './filters/additional-filter-buttons.js';

const event = new Event('onFilterChange');

export default async function decorate(block) {
  setInitialValuesFromUrl();
  /** build top menu html */
  const overlay = document.createElement('div');
  overlay.classList.add('overlay', 'hide');
  const additionalConfig = document.createElement('div');
  additionalConfig.append(buildFilterSearchTypesElement());
  const topMenuBlock = await topMenu.build();
  const additionalFiltersBlock = await additionalFilters.build();
  const buttons = await layoutButtons.build();
  block.append(topMenuBlock, additionalFiltersBlock, overlay, buttons);

  populatePreSelectedFilters();

  // close filters on click outside
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      closeTopLevelFilters();
    }
  });

  window.addEventListener('onFilterChange', (e) => {
    e.preventDefault();
    e.stopPropagation();
    searchProperty();
  });
  window.dispatchEvent(event);
}
