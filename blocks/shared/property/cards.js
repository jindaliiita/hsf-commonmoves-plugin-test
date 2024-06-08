import { decorateFormLinks } from '../../../scripts/scripts.js';
import {
  a, div, domEl, img, p, span,
} from '../../../scripts/dom-helpers.js';

function createImage(listing) {
  if (listing.SmallMedia?.length > 0) {
    const tempImg = img({
      src: listing.SmallMedia[0].mediaUrl, alt: listing.StreetName, loading: 'lazy', class: 'property-thumbnail',
    });
    return tempImg;
  }
  return div({ class: 'property-no-available-image' }, span('no images available'));
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

  let classes = 'listing-tile';
  if (listing.OpenHouses?.length > 0) {
    classes += ' has-open-houses';
  }

  if (listing.FeaturedListing) {
    classes += ' is-featured';
  }

  if (listing.PdpPath.includes('LuxuryTheme=true')) {
    classes += ' is-luxury';
  }
  const applicationType = listing.ListingType && listing.ListingType === 'For Rent' ? `<span class="property-label new-listing">${listing.ListingType}</span>` : '';

  if (listing.ClosedDate !== '01/01/0001') {
    classes += 'is-sold';
    listing.mlsStatus = 'Closed';
  }

  const newEl = div({ class: classes },
    a({ href: detailsPath, rel: 'noopener', 'aria-labelledby': `listing-${listing.ListingId}-address` },
      div({ class: 'listing-image-container' },
        div({ class: 'property-image' }, createImage(listing)),
        div({ class: 'image-position-top' },
          div({ class: 'property-labels' },
            div({ class: 'property-label luxury' }, 'Luxury Collection'),
            div({ class: 'property-label open-house' },
              span({ class: 'icon icon-openhouse' }, 'Open House'),
            ),
          ),
        ),
        div({ class: 'image-position-bottom' },
          div({ class: 'property-labels' },
            span({ class: 'property-label featured' }, 'Featured Listing'),
            applicationType,
            span({ class: 'property-label' }, listing.mlsStatus),
          ),
          div({ class: 'property-price' },
            p(listing.ListPriceUS),
          ),
        ),
      ),
    ),
    div({ class: 'property-details' },
      div({ class: 'property-info-wrapper' },
        div({ class: 'property-info' },
          div({ class: 'sold-date' }, `Closed: ${listing.ClosedDate}`),
          div({ id: `listing-${listing.PropId}-address`, class: 'address' },
            listing.StreetName,
            domEl('br'),
            `${listing.City}, `,
            `${listing.StateOrProvince} `,
            listing.PostalCode,
          ),
          div({ class: 'specs' }, specs.join(' / ')),
        ),
      ),
      div({ class: 'property-buttons' },
        div({ class: 'buttons-row-flex' },
          a({ 'aria-label': `Contact us about ${listing.StreetName}`, href: '/fragments/contact-property-form', class: 'button-property' },
            span({ class: 'icon icon-envelope' },
              img({
                'data-icon-name': 'envelope', src: '/icons/envelope.svg', loading: 'lazy', alt: 'envelope',
              }),
            ),
            span({ class: 'icon icon-envelopedark' },
              img({
                'data-icon-name': 'envelopedark', src: '/icons/envelopedark.svg', loading: 'lazy', alt: 'envelope',
              }),
            ),
          ),
          a({ 'aria-label': `Save ${listing.StreetName} to saved properties.`, href: '#', class: 'button-property' },
            span({ class: 'icon icon-heartempty' },
              img({
                'data-icon-name': 'heartempty', src: '/icons/heartempty.svg', loading: 'lazy', alt: 'heart',
              }),
            ),
            span({ class: 'icon icon-heartemptydark' },
              img({
                'data-icon-name': 'heartempty', src: '/icons/heartemptydark.svg', loading: 'lazy', alt: 'heart',
              }),
            ),
          ),
        ),
      ),
    ),
    domEl('hr'),
    div({ class: 'extra-info' },
      div(
        div({ class: 'courtesy-info' }, `Listing courtesy of: ${listing.CourtesyOf}`),
        div({ class: 'courtesy-provided' }, `Listing provided by: ${listing.listAor}`),
      ),
      div({ class: `listing-aor ${listing.listAor.toLowerCase()}` },
        img({
          class: 'rimls-image', src: '/styles/images/rimls_logo.jpg', alt: 'Disclaimer Logo Image', loading: 'lazy', height: '20', width: '33',
        }),
      ),
    ),
  );
  return newEl;
}

/**
 * Render the results of the provided search into the specified parent element.
 *
 * @param {HTMLElement} parent
 * @param {Object[]} properties results from CREG
 */

export function render(parent, properties = []) {
  const cards = [];
  properties.forEach((listing) => {
    cards.push(createCard(listing));
  });
  parent.replaceChildren(...cards);
  decorateFormLinks(parent);
}
