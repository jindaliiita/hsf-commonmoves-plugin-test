import { getMetadata, readBlockConfig } from '../../scripts/aem.js';
import { render as renderCards } from '../shared/property/cards.js';
import Search from '../../scripts/apis/creg/search/Search.js';
import { propertySearch } from '../../scripts/apis/creg/creg.js';
import {
  a, div, p, span,
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  // Find and process list type configurations.
  const config = readBlockConfig(block);
  const search = await Search.fromBlockConfig(config);
  search.franchiseeCode = getMetadata('office-id');
  const searchUrl = `search?${search.asCregURLSearchParameters()}`;

  if (config.title) {
    const blockTitle = div({ class: 'header' },
      div(
        span(config.title),
      ),
    );
    block.replaceChildren(blockTitle);

    if (config.link) {
      const moreBtn = div(
        p({ class: 'button-container' },
          a({ href: config['link-url'] || searchUrl, 'aria-label': config.link || 'See More', class: 'button secondary' },
            config.link || 'See More',
          ),
        ),
      );
      block.querySelector('.header').append(moreBtn);
    }
  } else {
    block.innerHTML = '';
  }

  const list = div({ class: `property-list-cards rows-${Math.floor(search.pageSize / 8)}` });
  block.append(list);
  propertySearch(search).then((results) => {
    window.propertyListings = results;
    renderCards(list, results.properties);
  });
}
