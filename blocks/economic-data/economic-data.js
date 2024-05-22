import { getDetails, getEconomicDetails } from '../../scripts/apis/creg/creg.js';
import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/aem.js';

const keys = [
  'ListPriceUS',
  'StreetName',
  'City',
  'StateOrProvince',
  'PostalCode',
  'Latitude',
  'Longitude',
  'LotSizeAcres',
  'LotSizeSquareFeet',
  'LivingAreaUnits',
  'Media',
  'SmallMedia',
  'PropId',
  'OpenHouses',
  'CourtesyOf',
];

function pick(obj, ...args) {
  return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), { });
}

function toggleAccordion(event) {
  const content = event.target;
  content.classList.toggle('active');
}

/**
 * Retrieves the property ID from the current URL path.
 * @returns {string|null} The property ID if found in the URL path, or null if not found.
 */
function getPropIdFromPath() {
  const url = window.location.pathname;
  const match = url.match(/pid-(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

async function getPropertyByPropId(propId) {
  const resp = await getDetails(propId);
  return resp[0];
}

async function getSocioEconomicData(latitude, longitude) {
  const resp = await getEconomicDetails(latitude, longitude);
  return resp[0];
}

function getHeaderLabels(title) {
  switch (title.toLowerCase()) {
    case 'occupancy':
      return 'Occupancy';
    case 'housing trends':
      return 'Housing Trends';
    case 'economic data':
      return 'Economic Data';
    default:
      return 'Untitled';
  }
}

function getColumnHeader(title, index) {
  switch (title.toLowerCase()) {
    case 'occupancy':
      return ['Owned', 'Rented', 'Vacant'][index - 1];
    case 'housing trends':
      return ['Home Appreciation', 'Median Age'][index - 1];
    case 'economic data':
      return ['Median House. Income', 'Unemployment', 'Cost of Living Index'][index - 1];
    default:
      return '';
  }
}

function getDataValue(item, title, index) {
  switch (title.toLowerCase()) {
    case 'occupancy':
      if (index === 1) {
        return `${item.ownerOccupiedPercent}%`;
      }
      if (index === 2) {
        return `${item.renterOccupiedPercent}%`;
      }
      return `${item.vacancyPercent}%`;
    case 'housing trends':
      if (index === 1) {
        return `${item.homeValueAppreciationPercent}%`;
      }
      return `${item.medianHomeAge}`;
    case 'economic data':
      if (index === 1) {
        return `${item.medianIncome}`;
      }
      return `${item.unemploymentPercent}%`;
    default:
      return '';
  }
}

function generateDataTable(block, title, socioEconData) {
  // Create the accordion structure
  const accordion = div({ class: 'accordion' },
    div({ class: 'accordion-header', onclick: (e) => toggleAccordion(e) }, getHeaderLabels(title), div({ class: 'tooltip' },
      span({ class: 'icon icon-info-circle' }),
      span({ class: 'icon icon-info-circle-dark' }),
      span({ class: 'tooltiptext' }, `${socioEconData.citation}`),
    ),
    ),
    div({ class: 'accordion-content' },
      div({ id: `${title.toLowerCase().replace(' ', '-')}-data-container`, class: 'container', role: 'grid' }),
    ),
  );
  block.appendChild(accordion);

  const container = document.getElementById(`${title.toLowerCase().replace(' ', '-')}-data-container`);

  // Create header row
  const headerRow = div({ class: 'row', role: 'row' },
    div({ class: 'cell cell-1 cell-header', role: 'columnheader' }),
    div({ class: 'cell cell-2 cell-header', role: 'columnheader' }, getColumnHeader(title, 1)),
    div({ class: 'cell cell-3 cell-header', role: 'columnheader' }, getColumnHeader(title, 2)),
    div({ class: 'cell cell-4 cell-header', role: 'columnheader' }, getColumnHeader(title, 3) ? getColumnHeader(title, 3) : ''),
  );
  container.appendChild(headerRow);

  // Create data rows
  socioEconData.data.forEach((item) => {
    const dataRow = div({ class: 'row', role: 'row' },
      div({ class: 'cell cell-1', role: 'cell' },
        div({ role: 'presentation' }, `${item.level.charAt(0).toUpperCase() + item.level.slice(1)}: ${item.label}`),
      ),
      div({ class: 'cell cell-2', role: 'cell' },
        getDataValue(item, title, 1),
        title.toLowerCase() === 'occupancy'
          ? div({ class: 'progress-bar' },
            span({ class: 'progress-owner', style: `width: ${item.ownerOccupiedPercent}%` }),
            span({ class: 'progress-renter', style: `width: ${100 - item.ownerOccupiedPercent}%` }),
          ) : '',
      ),
      div({ class: 'cell cell-3', role: 'cell' }, getDataValue(item, title, 2)),
      div({ class: 'cell cell-4', role: 'cell' }, title.toLowerCase() === 'housing trends' ? '' : getDataValue(item, title, 3)),
    );

    container.appendChild(dataRow);
  });
}

export default async function decorate(block) {
  let property = {};
  let propId = getPropIdFromPath(); // assumes the listing page pathname ends with the propId
  // TODO: remove this test propId
  if (!propId) propId = '370882966';

  const propertyData = await getPropertyByPropId(propId);
  if (propertyData) {
    property = pick(propertyData, ...keys);
    if (property.Latitude && property.Longitude) {
      const socioEconData = await getSocioEconomicData(property.Latitude, property.Longitude);
      if (socioEconData) {
        generateDataTable(block, 'Occupancy', socioEconData);
        generateDataTable(block, 'Housing Trends', socioEconData);
        generateDataTable(block, 'Economic Data', socioEconData);
      }
    }
  }
  decorateIcons(block);
  window.property = property;
}
