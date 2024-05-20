import {
  a, div, li, option, select, span, ul,
} from '../../scripts/dom-helpers.js';
import { closeOnBodyClick } from '../shared/search/util.js';
import Search, { UPDATE_SEARCH_EVENT } from '../../scripts/apis/creg/search/Search.js';
import { render as renderCards } from '../shared/property/cards.js';

/**
 * Builds the pagination of results
 * @param {Number} total total number of pages
 * @param {Number} current current page number
 */
function buildPagination(total, current) {
  if (Number.isNaN(total) || Number.isNaN(current)) return div();
  const options = [];
  const lis = [];
  for (let i = 1; i <= total; i += 1) {
    options.push(option({ value: i }, i));
    const config = { 'data-value': i };
    if (i === current) config.class = 'selected';
    lis.push(li(config, i));
  }
  const displayLabel = `${current} of ${total}`;
  const wrapper = div({ class: 'pagination-wrapper' },
    div({ class: 'select-wrapper' },
      select({ name: 'page', 'aria-label': displayLabel }, ...options),
      div({
        class: 'selected',
        role: 'button',
        'aria-haspopup': 'listbox',
        'aria-label': displayLabel,
        'aria-expanded': false,
        tabindex: 0,
      }, span(displayLabel)),
      ul({ class: 'select-items', role: 'listbox' }, ...lis),
    ),
    div({ class: 'link-wrapper' }),
  );

  const prev = a({
    class: 'prev',
    'aria-label': 'Previous Page',
    role: 'button',
    'data-value': `${current - 1}`,
  });
  prev.innerHTML = '<svg><use xlink:href="/icons/icons.svg#carrot"/></svg>';
  const next = a({
    class: 'next',
    'aria-label': 'Next Page',
    role: 'button',
    'data-value': `${current + 1}`,
  });
  next.innerHTML = '<svg><use xlink:href="/icons/icons.svg#carrot"/></svg>';

  if (current === 1) {
    prev.classList.add('disabled');
  } else if (current === total) {
    next.classList.add('disabled');
  }

  wrapper.querySelector('.link-wrapper').append(prev, next);

  closeOnBodyClick(wrapper);
  const selectWrapper = wrapper.querySelector('.select-wrapper');
  selectWrapper.querySelector('.selected').addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const open = selectWrapper.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });

  const changePage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const page = e.currentTarget.getAttribute('data-value');
    const search = await Search.fromQueryString(window.location.search);
    search.page = page;
    window.dispatchEvent(new CustomEvent(UPDATE_SEARCH_EVENT, { detail: { search, redraw: false } }));
  };

  selectWrapper.querySelectorAll('.select-items li').forEach((opt) => {
    opt.addEventListener('click', changePage);
  });
  prev.addEventListener('click', changePage);
  next.addEventListener('click', changePage);
  return wrapper;
}

/**
 * Renders the search results as cards into the specified contianer
 * @param parent
 * @param results
 */
// eslint-disable-next-line import/prefer-default-export
export function displayResults(parent, results) {
  const cards = div({ class: 'search-results-cards property-list-cards' });
  renderCards(cards, results.properties);
  const pagination = div({ class: 'search-results-pagination' },
    buildPagination(parseInt(results.pages, 10), parseInt(results.page, 10)),
  );
  parent.replaceChildren(cards, pagination);
}
