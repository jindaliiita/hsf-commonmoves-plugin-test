import { getMetadata } from '../../scripts/lib-franklin.js';
import { getSpinner } from '../../scripts/util.js';
import {
  fromParam as filterFromParam,
} from '../../scripts/apis/agent/Filter.js';
import {
  sortFor,
} from '../../scripts/apis/agent/sort.js';
import SearchParameters from '../../scripts/apis/agent/SearchParameters.js';
import { search as searchAgents } from '../../scripts/apis/agent/agent.js';
import { buildCount, COUNT_SELECTOR } from './builders/count.js';
import { buildSort, SORT_PARAM, SORT_SELECTOR } from './builders/sort.js';
import { buildSearchBar } from './builders/form.js';
import {
  buildPagination,
  PAGE_PARAM,
  PAGINATION_SELECTOR,
  PER_PAGE_PARAM,
} from './builders/pagination.js';
import { buildSelectionTags } from './builders/tags.js';
import { buildResults, RESULTS_SELECTOR } from './builders/results.js';

const officeId = getMetadata('office-id');

const search = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParams = new SearchParameters(officeId);

  const sortId = urlParams.get(SORT_PARAM);
  urlParams.delete(SORT_PARAM);
  searchParams.sortBy = sortId ? sortFor(parseInt(sortId, 10)) : undefined;

  const perPage = urlParams.get(PER_PAGE_PARAM);
  urlParams.delete(PER_PAGE_PARAM);
  searchParams.pageSize = parseInt(perPage, 10) || 10;

  const page = urlParams.get(PAGE_PARAM);
  urlParams.delete(PAGE_PARAM);
  searchParams.page = parseInt(page, 10) || 1;

  urlParams.forEach((value, key) => {
    const filter = filterFromParam(key);
    searchParams.addFilter(filter, value);
  });
  return searchAgents(searchParams);
};

const updateSearch = async (callback) => {
  const block = document.querySelector('.agent-search.block');
  const spinner = getSpinner();
  block.append(spinner);
  // Run the search
  const agents = await search();
  const total = agents['@odata.count'];

  // Fix the tags
  const wrapper = block.querySelector('.search-bar-wrapper');
  const existingTags = wrapper.querySelector('.selection-tags');
  const newTags = buildSelectionTags();
  wrapper.replaceChild(newTags, existingTags);

  block.querySelector(COUNT_SELECTOR).replaceWith(buildCount(total));

  const promises = [];

  [...block.querySelectorAll(SORT_SELECTOR)].forEach((sort) => {
    promises.push(buildSort(callback).then((newSort) => sort.replaceWith(newSort)));
  });

  [...block.querySelectorAll(PAGINATION_SELECTOR)].forEach((pagination) => {
    promises.push(
      buildPagination(total, callback)
        .then((newPagination) => pagination.replaceWith(newPagination)),
    );
  });

  await Promise.all(promises);

  block.querySelector(RESULTS_SELECTOR).replaceWith(buildResults(agents.value));
  spinner.remove();
  wrapper.scrollIntoView({ behavior: 'smooth' });
};

const updateLocation = async (newUrlParams) => {
  const existingUrlParams = new URLSearchParams(window.location.search);
  if (newUrlParams.toString() !== existingUrlParams.toString()) {
    const url = new URL(`${window.location.pathname}?${newUrlParams}`, window.location);
    window.history.pushState('', '', url.toString());
    await updateSearch(updateLocation);
  }
};

export default async function decorate(block) {
  const agents = await search();
  const total = agents['@odata.count'];

  const wrapper = document.createElement('div');
  wrapper.classList.add('search-bar-wrapper');
  wrapper.append(buildSearchBar(updateLocation));
  wrapper.append(buildSelectionTags());

  const details = document.createElement('div');
  details.classList.add('search-details');
  details.append(buildCount(total));
  details.append(await buildSort(updateLocation));
  details.append(await buildPagination(total, updateLocation));

  const footer = document.createElement('div');
  footer.classList.add('search-footer');
  footer.append(await buildPagination(total, updateLocation));

  block.append(wrapper);
  block.append(details);
  block.append(buildResults(agents.value));
  block.append(footer);

  window.addEventListener('popstate', updateSearch);
}
