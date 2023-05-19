import { readBlockConfig } from '../../scripts/lib-franklin.js';
import ApplicationType, { applicationTypeFor } from '../../scripts/apis/creg/ApplicationType.js';
import SearchType, { searchTypeFor } from '../../scripts/apis/creg/SearchType.js';
import PropertyType from '../../scripts/apis/creg/PropertyType.js';
import MapSearch from './map-search.js';
import RadiusSearch from './radius-search.js';

export default async function decorate(block) {
  // Find and process list type configurations.
  const listingTypes = [];
  [...block.children].forEach((child) => {
    if (/listing.?type/.test(child.children[0].textContent.toLowerCase())) {
      // Check for a list
      const items = child.querySelectorAll('div > ul > li');
      if (items) {
        items.forEach((item) => {
          const type = applicationTypeFor(item.textContent.toUpperCase().replaceAll(/[^A-Z_]/g, '_'));
          if (type) {
            listingTypes.push(type);
          }
        });
      } else { // Otherwise treat as single entry.
        const type = applicationTypeFor(child.children[1].textContent.toUpperCase().replaceAll(/[^A-Z_]/g, '_'));
        if (type) {
          listingTypes.push(type);
        }
      }
      // eslint-disable-next-line no-unused-expressions
      listingTypes.length === 0 && listingTypes.push(ApplicationType.FOR_SALE);
    }
  });
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

  let search;

  const keys = Object.keys(config);
  const [type] = keys.filter((k) => /search.*type/.test(k)).map((k) => searchTypeFor(config[k]));

  if (type === SearchType.Map) {
    const [minLat] = keys.filter((k) => k.includes('min') && k.includes('lat')).map((k) => config[k]);
    const [maxLat] = keys.filter((k) => k.includes('max') && k.includes('lat')).map((k) => config[k]);
    const [minLon] = keys.filter((k) => k.includes('min') && k.includes('lon')).map((k) => config[k]);
    const [maxLon] = keys.filter((k) => k.includes('max') && k.includes('lon')).map((k) => config[k]);
    search = new MapSearch(minLat, minLon, maxLat, maxLon);
  } else if (type === SearchType.Radius) {
    let [lat] = keys.filter((k) => k.includes('lat')).map((k) => config[k]);
    let [lon] = keys.filter((k) => k.includes('lat')).map((k) => config[k]);
    const [radius] = keys.filter((k) => k.includes('distance')).map((k) => config[k]);

    // Go looking for the search parameters.
    if (!lat) {
      const urlParams = new URLSearchParams(window.location.search);
      lat = urlParams.get('latitude');
      lon = urlParams.get('longitude');
    }

    search = new RadiusSearch(lat, lon, radius);
  }

  search.minPrice = config.minprice;
  search.pageSize = config.pagesize;
  search.sortBy = config['sort-by'];
  search.sortDirection = config['sort-direction'];
  search.propertyTypes = [
    PropertyType.CONDO_TOWNHOUSE,
    PropertyType.SINGLE_FAMILY,
    PropertyType.MULTI_FAMILY,
  ];

  search.listingTypes = listingTypes;
  search.isNew = config.newlisting;
  await search.render(block, false);
}
