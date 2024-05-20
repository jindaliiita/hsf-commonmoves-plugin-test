import { createAccordionItem } from '../../scripts/accordion.js';
import { decorateIcons, loadCSS } from '../../scripts/aem.js';

function createTableRow(levelData) {
  const label = levelData.level === 'zipcode' ? `Zip Code: ${levelData.label}` : levelData.label;
  const rowHTML = `
    <tr>
      <td>
        <h6>${label}</h6>
      </td>
      <td class="cmp-socio-economic-data__stat percentage">
        ${levelData.homeValueAppreciationPercent}
        <span class="percentage">%</span></td>
      <td class="cmp-socio-economic-data__stat year">${levelData.medianHomeAge}y</td>
      <td></td>
    </tr>
  `;
  return rowHTML;
}

export default async function decorate(block) {
  if (window.socioEconomicData && window.socioEconomicData.data) {
    const socioEconData = window.socioEconomicData.data;
    const citation = 'Market data provided by U.S. Census Bureau';
    let housingTableHTML = `
      <div class="property-container">
        <div class="property-row">
          <div class="col col-12 col-lg-10 offset-lg-1 col-md-10 offset-md-1">
            <table class="cmp-socio-economic-data--table">
              <thead slot="head">
                <th aria-label="No value"></th>
                <th>Home Appreciation</th>
                <th>Median Age</th>
                <th aria-label="No value"></th>
              </thead>
              <tbody>
    `;
    socioEconData.forEach((elem) => {
      housingTableHTML += createTableRow(elem);
    });
    housingTableHTML += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    const housingAccordionItem = createAccordionItem('housing-trends', 'Housing Trends', housingTableHTML, citation);
    block.append(housingAccordionItem);
    decorateIcons(block);
    loadCSS(`${window.hlx.codeBasePath}/styles/templates/accordion/accordion.css`);
    loadCSS(`${window.hlx.codeBasePath}/styles/templates/property-details/property-details.css`);
    loadCSS(`${window.hlx.codeBasePath}/styles/templates/property-details/property-details-table.css`);
  }
}
