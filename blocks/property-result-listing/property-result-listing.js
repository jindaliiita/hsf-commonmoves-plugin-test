import { createCard } from '../property-listing/cards/cards.js';
import {
  getDisclaimer,
  getPropertiesCount,
  getPropertyDetails,
  getAllData,
} from '../../scripts/search/results.js';
import { getValueFromStorage, searchProperty, setFilterValue } from '../property-search-bar/filter-processor.js';
import renderMap from '../property-result-map/map.js';
import {
  showModal,
} from '../../scripts/util.js';

const event = new Event('onFilterChange');
const ITEMS_PER_PAGE = 32;
function buildLoader() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('search-results-loader');
  wrapper.innerHTML = `
    <div class="search-results-loader-image enter">
    <video autoplay loop muted playsinline>
        <source src="/icons/maps/loader_opt.webm" type="video/webm" />
        <source src="/icons/maps/loader_opt.mp4" type="video/mp4" />
     </video>
    </div>
  `;
  return wrapper;
}
function updateStyles(count, div, items = 4) {
  if (count < ITEMS_PER_PAGE) {
    // adjust block height
    const lines = Math.ceil(count / items);
    const height = lines * 400 + 20 * (lines - 1);
    div.style.height = `${height}px`;
    div.style.gridTemplate = `repeat(${lines}, 400px) / repeat(${items}, 1fr)`;
  } else {
    div.style = '';
  }
}

function buildPropertySearchResultsButton() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('property-search-results-buttons');
  wrapper.innerHTML = `
      <section>
        <a rel="noopener" target="_blank" tabIndex="" class="btn btn-map" role="button">
          <span class="text-up">Save</span>
        </a>
      </section>
      <section>
          <a rel="noopener" target="_blank" tabIndex="" class="btn btn-map map" role="button">
            <span class="text-up">list view</span>
          </a>
        </section>
    `;
  return wrapper;
}

function buildDisclaimer(html) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('disclaimer');
  wrapper.innerHTML = `
    <hr role="presentation" aria-hidden="true" tabindex="-1"> 
    <div class="text">
    ${html}
    </div>
  `;
  return wrapper;
}

function buildPagination(currentPage, totalPages) {
  // set map view
  document.querySelector('body').classList.add('search-map-active');
  const wrapper = document.createElement('div');
  wrapper.setAttribute('name', 'Page');
  wrapper.classList.add('multiple-inputs');
  let options = '';
  let list = '';
  for (let i = 1; i <= totalPages; i += 1) {
    options += `<option value="${i}">${i}</option>`;
  }
  for (let i = 1; i <= totalPages; i += 1) {
    list += `<li data-value="${i}" role="option">${i}</li>`;
  }
  wrapper.innerHTML = `
        <div class="search-results-dropdown">
            <div class="select-wrapper">
                <select class ="hide" aria-label="${`${currentPage} of ${totalPages}`}">${options}</select>
                <div class="select-selected text-up" role="button" aria-haspopup="listbox">
                    ${`${currentPage} of ${totalPages}`}
                </div>
                <ul class="select-item hide" role="listbox">
                    ${list}
                </ul>
            </div>
        </div>
        <div class="pagination-arrows">
          <a class="prev arrow ${currentPage === 1 && 'disabled'}" role="button" aria-label="Previous Page"></a> 
          <a class="next arrow ${currentPage === totalPages && 'disabled'}" role="button" aria-label="Next Page"></a>
        </div>`;
  return wrapper;
}

export default async function decorate(block) {
  block.textContent = '';
  block.append(buildLoader());
  await renderMap(block);
  window.dispatchEvent(event);
  window.addEventListener('onResultUpdated', () => {
    if (getPropertiesCount() > 0) {
      document.querySelector('.property-result-map-container').style.display = 'block';
      const propertyResultContent = document.createElement('div');
      propertyResultContent.classList.add('property-result-content');
      const listings = getPropertyDetails();
      const div = document.createElement('div');
      div.classList.add('property-list-cards');
      const currentPage = parseInt(getValueFromStorage('Page'), 10);
      const totalPages = Math.ceil(getPropertiesCount() / ITEMS_PER_PAGE);
      const disclaimerHtml = getDisclaimer() === '' ? '' : getDisclaimer().Text;

      const disclaimerBlock = buildDisclaimer(disclaimerHtml);
      let nextPage;
      listings.forEach((listing) => {
        div.append(createCard(listing));
      });
      updateStyles(listings.length, div, 2);
      propertyResultContent.append(div);
      /** add pagination */
      propertyResultContent.append(buildPagination(currentPage, totalPages));
      /** add property search results button */
      propertyResultContent.append(buildPropertySearchResultsButton());
      /** build disclaimer */
      propertyResultContent.append(buildDisclaimer(disclaimerHtml));
      block.prepend(propertyResultContent);

      // update map
      window.updatePropertyMap(getAllData(), false);

      document.querySelector('.property-result-map-container').append(disclaimerBlock);
      /** update page on select change */
      block.querySelector('[name="Page"] .select-selected').addEventListener('click', () => {
        block.querySelector('[name="Page"] ul').classList.toggle('hide');
      });
      block.querySelector('[name="Page"] ul').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextPage = e.target.closest('li').getAttribute('data-value');
        setFilterValue('Page', nextPage);
        block.querySelector('[name="Page"] ul').classList.toggle('hide');
        searchProperty();
      });
      /** update page on arrow click */
      block.querySelector('.pagination-arrows .arrow.prev').addEventListener('click', (e) => {
        if (!e.target.closest('.arrow').classList.contains('disabled')) {
          e.preventDefault();
          e.stopPropagation();
          setFilterValue('Page', currentPage - 1);
          searchProperty();
        }
      });
      block.querySelector('.pagination-arrows .arrow.next').addEventListener('click', (e) => {
        if (!e.target.closest('.arrow').classList.contains('disabled')) {
          e.preventDefault();
          e.stopPropagation();
          setFilterValue('Page', currentPage + 1);
          searchProperty();
        }
      });
      document.querySelector('.map-toggle > a').addEventListener('click', (e) => {
        const span = e.target.closest('span');
        if (span.innerText === 'GRID VIEW') {
          span.innerText = 'map view';
          document.querySelector('body').classList.remove('search-map-active');
          updateStyles(listings.length, div, 4);
        } else {
          span.innerText = 'grid view';
          document.querySelector('body').classList.add('search-map-active');
          updateStyles(listings.length, div, 2);
        }
      });
      block.querySelector('.property-search-results-buttons .map').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const span = e.target.closest('span');
        if (span.innerText === 'LIST VIEW') {
          span.innerText = 'map view';
          document.querySelector('body').classList.remove('search-map-active');
          updateStyles(listings.length, div, 1);
        } else {
          span.innerText = 'list view';
          document.querySelector('body').classList.add('search-map-active');
        }
      });
    } else {
      document.querySelector('.property-result-map-container').style.display = 'none';
      showModal('Your search returned 0 results.\n'
          + 'Please modify your search and try again.');
    }
  });
}
