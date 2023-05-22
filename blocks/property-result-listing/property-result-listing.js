import { createCard } from '../property-listing/cards/cards.js';
import { getDisclaimer, getPropertiesCount, getPropertyDetails } from '../../scripts/search/results.js';
import { getValueFromStorage, searchProperty, setFilterValue } from '../property-search-bar/filter-processor.js';

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
            <span class="text-up">map view</span>
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

export default function decorate(block) {
  window.addEventListener('onResultUpdated', () => {
    const listings = getPropertyDetails();
    const div = document.createElement('div');
    div.classList.add('property-list-cards');
    const currentPage = parseInt(getValueFromStorage('Page'), 10);
    const totalPages = Math.ceil(getPropertiesCount() / 32);
    const disclaimerHtml = getDisclaimer() === '' ? '' : getDisclaimer().Text;
    let nextPage;
    listings.forEach((listing) => {
      div.append(createCard(listing));
    });
    // decorateIcons(ul);
    block.textContent = '';
    block.append(div);
    /** add pagination */
    block.append(buildPagination(currentPage, totalPages));
    /** add property search results button */
    block.append(buildPropertySearchResultsButton());
    /** build disclaimer */
    block.append(buildDisclaimer(disclaimerHtml));
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
    block.querySelector('.property-search-results-buttons .map').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const span = e.target.closest('span');
      if (span.innerText === 'LIST VIEW') {
        span.innerText = 'map view';
        document.querySelector('body').classList.remove('search-map-active');
      } else {
        span.innerText = 'list view';
        document.querySelector('body').classList.add('search-map-active');
      }
    });
  });
}
