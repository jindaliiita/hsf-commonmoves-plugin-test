import { propertySearch } from '../../../scripts/apis/creg/creg.js';
import { decorateIcons } from '../../../scripts/lib-franklin.js';

function createImage(listing) {
  if (listing.SmallMedia?.length > 0) {
    return `<img src="${listing.SmallMedia[0].mediaUrl}" alt="Property Image" loading="lazy" class="property-thumbnail">`;
  }
  return '<div class="property-no-available-image"><span>no images available</span></div>';
}

export function createCard(listing) {
  let detailsPath = listing.PdpPath;
  if (listing.PdpPath.includes('commonmoves.com')) {
    const seoName = [listing.StreetName, listing.City, listing.StateOrProvince, listing.PostalCode].map((v) => v.toLowerCase().replaceAll(/[^a-zA-Z0-9-]/g, '-')).join('-');
    detailsPath = `/property/detail/${seoName}/pid-${listing.PropId}?longitude=${listing.Longitude}&latitude=${listing.Latitude}`;
  }

  const specs = [];
  if (listing.BedroomsTotal && listing.BedroomsTotal > 0) {
    specs.push(`${listing.BedroomsTotal} Bed`);
  }

  if (listing.BathroomsTotal && listing.BathroomsTotal > 0) {
    specs.push(`${listing.BathroomsTotal} Bath`);
  }

  if (listing.LivingArea && listing.LivingAreaUnits) {
    specs.push(`${listing.LivingArea} ${listing.LivingAreaUnits}`);
  }

  const item = document.createElement('div');
  item.classList.add('listing-tile');
  if (listing.OpenHouses?.length > 0) {
    item.classList.add('has-open-houses');
  }

  if (listing.FeaturedListing) {
    item.classList.add('is-featured');
  }

  if (listing.PdpPath.includes('LuxuryTheme=true')) {
    item.classList.add('is-luxury');
  }

  if (listing.ClosedDate !== '01/01/0001') {
    item.classList.add('is-sold');
    listing.mlsStatus = 'Closed';
  }

  item.innerHTML = `
    <a href="${detailsPath}" rel="noopener" aria-label="${listing.StreetName}">
      <div class="listing-image-container"> 
        <div class="property-image"> 
          ${createImage(listing)} 
        </div>
        <div class="image-position-top">
          <div class="property-labels">
            <div class="property-label luxury">Luxury Collection</div>
            <div class="property-label open-house">
              <span class="icon icon-openhouse"></span>
              Open House
            </div>
          </div>
        </div>
        <div class="image-position-bottom"> 
          <div class="property-labels">
            <span class="property-label featured">Featured Listing</span>
            <span class="property-label">${listing.mlsStatus}</span>
          </div>
          <div class="property-price">
              ${listing.ListPriceUS}
          </div> 
        </div> 
      </div>
    </a>
    <div class="property-details">
      <div class="property-info-wrapper"> 
        <div class="property-info"> 
          <div class="sold-date">Closed: ${listing.ClosedDate}</div>
          <div class="address"> 
            ${listing.StreetName}
            <br> 
            ${listing.City}, ${listing.StateOrProvince} ${listing.PostalCode} 
          </div> 
          <div class="specs">${specs.join(' / ')}</div> 
        </div> 
      </div> 
      <div class="property-buttons"> 
        <div class="buttons-row-flex"> 
          <a aria-label="Contact Form" href="#" class="button-property"> 
            <span class="icon icon-envelope"></span>
            <span class="icon icon-envelopedark"></span>
          </a> 
          <a aria-label="Save" href="#" class="button-property"> 
            <span class="icon icon-heartempty"></span>
            <span class="icon icon-heartemptydark"></span>
          </a>
        </div>
      </div>
    </div>
    <hr> 
    <div class="extra-info">
      <div> 
        <div class="courtesy-info">Listing courtesy of: ${listing.CourtesyOf}</div>
        <div class="courtesy-provided">Listing provided by: ${listing.listAor}</div>
      </div>
      <div class="listing-aor ${listing.listAor.toLowerCase()}">
        <img class="rimls-image" src="/styles/images/rimls_logo.jpg" alt="Disclaimer Logo Image" loading="lazy" height="20" width="33">
      </div>
    </div>
  `;
  return item;
}

/**
 * Render the results of the provided search into the specified parent element.
 *
 * @param {SearchParameters} searchParams
 * @param {HTMLElement} parent
 * @return {Promise<void>}
 */
export async function render(searchParams, parent) {
  const list = document.createElement('div');
  list.classList.add('property-list-cards');
  parent.append(list);

  propertySearch(searchParams).then((results) => {
    if (results?.properties) {
      results.properties.forEach((listing) => {
        list.append(createCard(listing));
      });
      decorateIcons(parent);
    }
  });
}
