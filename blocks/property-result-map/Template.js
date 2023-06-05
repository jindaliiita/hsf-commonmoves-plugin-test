export default class Template {
  // eslint-disable-next-line class-methods-use-this
  render = (data) => {
    const luxuryHTML = data.luxury && data.isCompanyListing
      ? `div class="position-absolute top w-100">
                <div class="cmp-property-tile__image-labels">
                    <span class="cmp-property-tile__label--luxury text-uppercase">${data.luxuryLabel}</span>
                </div>
            </div>`
      : '';
    const soldHTML = data.sellingOfficeName ? `<div class="text-danger">${data.mlsStatus} ${data.ClosedDate}<br/></div>` : '';
    const municipalityHTML = data.municipality ? `<div class="address">${data.municipality}</div>` : '';
    const CourtesyOfHr = data.CourtesyOf ? `
          <hr style="margin-top: 0px; margin-bottom: 0px;">` : '';
    const addMlsFlagHTML = data.addMlsFlag ? `<span  class="cmp-property-tile__extra-info" style="padding-left: 0px">MLS ID: ${data.ListingId} </span>` : '';
    const courtersyHTML = data.CourtesyOf ? `
      <span class="cmp-property-tile__extra-info" style="padding-left: 0px">Listing courtesy of: ${data.CourtesyOf} </span>` : '';
    const sellingOfficeNameHTML = data.sellingOfficeName ? `
          <span class="cmp-property-tile__extra-info" style="padding-left: 0px">Listing sold by: ${data.sellingOfficeName} </span>` : '';
    const addMLsFlagHTML = data.addMlsFlag ? `
          <div class="cmp-property-tile__extra-info d-flex align-items-center justify-content-between" style="padding: 0px; margin-top: -5px;"><div>Listing Provided by: ${data.listAor}</div>
  ${data.listAor}
  ${data.brImageUrl}
      <div class="cmp-property-search-results__disclaimer__logo" >
          <div style="background-image:url(${data.brImageUrl}); background-size: contain;
                background-repeat: no-repeat;
                width: 60px;
                height: 30px;"></div>
          ${data.ImageUrl}
      </div>
  </div>
      ${data.ddMlsFlag}` : '';
    return `<div class="info-window">
    <a href="${data.linkUrl}" rel="noopener">
        <div class="property-image" style="background-image:url(${data.image}); background-size:cover;">
            ${luxuryHTML}
        </div>
        <div class="info" style="padding: 5px">
            <div class="d-flex align-items-center p-0" style="flex-wrap:wrap;">
                <div class="price">${data.price}</div><br/>
                <div class="altPrice">${data.altCurrencyPrice || ''}</div>
                <div class="btn-contact-property p-0 mr-2"
                     data-brand="undefined"
                     data-lead-param="CompanyKey=CA321&amp;LeadBrand=11413101001000010000"
                     data-pdp-path="https://www.bhhsfranciscan.com/ca/224-sea-cliff-avenue-san-francisco-94121/pid-2217354422?lead=CompanyKey%3DCA321%26LeadBrand%3D11413101001000010000"
                     data-prop-id="${data.propertyId}"
                     data-street-name="${data.address}"
                     data-city="${data.city}"
                     data-state-or-province="${data.stateOrProvince}"
                     data-postal-code="${data.postalCode}"
                     data-providers="${data.providers || ''}"
                >
                    <svg class="envelope">
                        <use xlink:href="/icons/icons.svg#envelope"></use>
                    </svg>
                    <svg class="envelope-dark">
                        <use xlink:href="/icons/icons.svg#envelope-dark"></use>
                    </svg>
                </div>
                <div class="btn-save-property p-0 mr-2" data-prop-id="${data.propertyId}" data-street-name="${data.address}">
                    <svg class="empty">
                        <use xlink:href="/icons/icons.svg#heart-empty"></use>
                    </svg>
                    <svg class="empty-dark">
                        <use xlink:href="/icons/icons.svg#heart-empty-dark"></use>
                    </svg>
                    <svg class="full">
                        <use xlink:href="/icons/icons.svg#heart-full"></use>
                    </svg>
                </div>
            </div>
            <div class="address">
                ${soldHTML}
                <div>
                    ${data.address || ''}<br/>
                    ${data.city || ''}, ${data.stateOrProvince || ''} ${data.postalCode || ''}
                </div>
            </div>
            ${municipalityHTML}
            <div class="providers">${data.providers || ''}</div>
            ${CourtesyOfHr}
            <div>
                ${addMlsFlagHTML}
                ${courtersyHTML}
                ${sellingOfficeNameHTML}
            </div>
            ${addMLsFlagHTML}
        </div>
    </a>
    <div class="arrow"></div>
</div>`;
  };
}
