import { getMetadata, readBlockConfig } from '../../scripts/aem.js';
import { render as renderCards } from '../shared/property/cards.js';
import Search from '../../scripts/apis/creg/search/Search.js';
import { propertySearch } from '../../scripts/apis/creg/creg.js';

export default async function decorate(block) {
  // Find and process list type configurations.
  const config = readBlockConfig(block);

  if (config.title) {
    block.innerHTML = `
      <div class="header">
        <div>
          <span>${config.title}</span>
        </div>
      </div>
    `;
    if (config['link-text']) {
      const div = document.createElement('div');
      const url = config['link-url'] || '';
      div.innerHTML = `
      <p class="button-container">
        <a href="${url}" aria-label="${config['link-text'] || 'See More'}">${config['link-text'] || 'See More'}</a>
      </p>`;
      block.querySelector('.header').append(div);
    }
  } else {
    block.innerHTML = '';
  }

  const search = await Search.fromBlockConfig(config);
  search.franchiseeCode = getMetadata('office-id');
  const list = document.createElement('div');
  list.classList.add('property-list-cards', `rows-${Math.floor(search.pageSize / 8)}`);
  block.append(list);
  propertySearch(search).then((results) => {
    window.propertyListings = results;
    renderCards(list, results.properties);
  });
}
