import { togglePropertyForm } from '../common-function.js';
import { populatePreSelectedFilters, setFilterValue, setInitialValuesFromUrl } from '../filter-processor.js';

const event = new Event('onFilterChange');

function addEventListeners() {
  const block = document.querySelector('.property-search-bar.block');
  // close form on click cancel button
  block.querySelector('.filter-buttons a[title="cancel"]').addEventListener('click', () => {
    togglePropertyForm();
  });
  // reset form on click reset button
  block.querySelector('.filter-buttons a[title="reset"]').addEventListener('click', () => {
    // @todo set up initial values
    setInitialValuesFromUrl();
    // layout fields
    populatePreSelectedFilters(false);
    // top menu
    populatePreSelectedFilters();
  });
  // apply filters on click apply button
  block.querySelector('.filter-buttons a[title="apply"]').addEventListener('click', () => {
    togglePropertyForm();
    setFilterValue('MinPrice', document.querySelector('.filter [name="MinPrice"]').value);
    setFilterValue('MaxPrice', document.querySelector('.filter [name="MaxPrice"]').value);
    populatePreSelectedFilters();
    window.dispatchEvent(event);
  });
}
addEventListeners();
