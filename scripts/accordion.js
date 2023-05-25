function openAccordion() {
  var parent = this.closest('.accordion-item');
  parent.classList.toggle('collapse');
}

function createAccordionHeader(heading, tooltipText) {
  const accordionTitle = document.createElement('div');
  accordionTitle.className = 'accordion-title';
  var headerHTML = `
    <div class="property-container">
      <div class="property-row">
        <div class="col col-12 offset-md-1 col-md-10">
          <div class="accordion-header">
            <h2 class="accordion-header-title">${heading}</h2>
  `;
  if(tooltipText) {
    headerHTML += `
            <div class="tooltip">
              <span class="icon icon-info_circle"></span>
              <span class="icon icon-info_circle_dark"></span>
              <span class="tooltiptext">${tooltipText}</span>
            </div>
    `;
  }
  headerHTML += `
          </div>
        </div>
      </div>
    </div>
  `;
  accordionTitle.innerHTML = headerHTML;
  return accordionTitle;
}

export function createAccordionItem(className, headerTitle, innerHTML, citation='') {
  const accordionItem = document.createElement('div');
  accordionItem.className = `accordion-item ${className}`;
  const accordionTitle = createAccordionHeader(headerTitle, citation);
  const accordionBody = document.createElement('div');
  accordionBody.className = 'accordion-body';
  accordionBody.innerHTML = innerHTML;
  accordionItem.append(accordionTitle);
  accordionItem.append(accordionBody);
  var accordionHeader = accordionItem.querySelector('.accordion-header');
  accordionHeader.addEventListener('click', openAccordion);
  return accordionItem;
}
