import { createAccordionItem } from '../../scripts/accordion.js';
import { decorateIcons, loadCSS } from '../../scripts/aem.js';

function createTableRow(levelData) {
  const label = levelData.level === 'zipcode' ? `Zip Code: ${levelData.label}` : levelData.label;
  const rowHTML = `
    <tr>
      <td>
        <h6>${label}</h6>
      </td>
      <td class="cmp-socio-economic-data__stat">
        ${levelData.ownerOccupiedPercent}
        <span class="percentage">%</span>
        <div class="progress-bar"><span class="progress-owner" style="width: ${levelData.ownerOccupiedPercent}%;"></span> <span class="progress-renter"
            style="width: ${levelData.renterOccupiedPercent}%;"></span></div>
      </td>
      <td class="cmp-socio-economic-data__stat percentage">
        ${levelData.renterOccupiedPercent}
        <span class="percentage">%</span></td>
      <td class="cmp-socio-economic-data__stat percentage">
        ${levelData.vacancyPercent}
        <span class="percentage">%</span></td>
    </tr>
  `;
  return rowHTML;
}
export default async function decorate(block) {
  if (window.socioEconomicData && window.socioEconomicData.data) {
    const socioEconData = window.socioEconomicData.data;
    const citation = 'Market data provided by U.S. Census Bureau';
    let occupancyHTML = `
      <div class="property-container">
        <div class="property-row">
          <div class="col col-12 col-lg-10 offset-lg-1 col-md-10 offset-md-1">
            <table class="cmp-socio-economic-data--table">
              <thead slot="head">
                <th aria-label="No value"></th>
                <th>Owned</th>
                <th>Rented</th>
                <th aria-label="No value">Vacant</th>
              </thead>
              <tbody>
    `;
    socioEconData.forEach((elem) => {
      occupancyHTML += createTableRow(elem);
    });
    occupancyHTML += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    const occupancyAccordionItem = createAccordionItem('occupancy', 'Occupancy', occupancyHTML, citation);
    block.append(occupancyAccordionItem);
    decorateIcons(block);
    loadCSS(`${window.hlx.codeBasePath}/styles/templates/accordion/accordion.css`);
    loadCSS(`${window.hlx.codeBasePath}/styles/templates/property-details/property-details.css`);
    loadCSS(`${window.hlx.codeBasePath}/styles/templates/property-details/property-details-table.css`);
  }
}
