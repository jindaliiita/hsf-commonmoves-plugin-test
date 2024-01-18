/**
 * Returns block content from the spreadsheet
 *
 * @param {String} Data url
 * @returns {Promise<any>}
 */
async function getContent(url) {
  let data = { data: [] };
  try {
    const resp = await fetch(url);
    if (resp.ok) {
      data = resp.json();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load block content', error);
  }
  return data;
}

function getTitle(block) {
  const titleElem = [...block.querySelectorAll('div')]
    .filter((e) => e.innerText.toLowerCase() === 'title');
  return titleElem.length > 0 ? titleElem[0].nextElementSibling.innerText : '';
}

let alreadyDeferred = false;
function observeCarousel() {
  if (alreadyDeferred) {
    return;
  }
  alreadyDeferred = true;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = `${window.hlx.codeBasePath}/blocks/quote-carousel/quote-carousel-delayed.js`;
  document.head.append(script);
}

export default async function decorate(block) {
  const blockId = crypto && crypto.randomUUID ? crypto.randomUUID() : 'UUID-CRYPTO-NEEDS-HTTPS';
  const dataUrl = block.querySelector('div > div > div:nth-child(2) > a').href;
  const title = getTitle(block);
  // generate carousel content from loaded data
  block.setAttribute('id', blockId);
  block.innerHTML = '';

  const titleElement = document.createElement('p');
  titleElement.innerText = title.trim();
  titleElement.classList.add('title');

  const controlsContainer = document.createElement('div');
  controlsContainer.classList.add('controls-container');

  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('carousel-content');

  block.replaceChildren(titleElement, slidesContainer, controlsContainer);

  const content = await getContent(dataUrl);

  if (content.data.length > 0) {
    [...content.data].forEach((row) => {
      const rowContent = document.createElement('div');
      if (!row.quote.startsWith('"')) {
        row.quote = `"${row.quote}`;
      }
      if (!row.quote.endsWith('"')) {
        row.quote = `${row.quote}"`;
      }
      rowContent.classList.add('item');
      rowContent.innerHTML = `
                <p class="quote">${row.quote}</p>
                <p class="author">${row.author}</p>
                <p class="position">${row.position}</p>
                `;
      rowContent.classList.add('item');
      slidesContainer.appendChild(rowContent);
    });
    slidesContainer.children[0].setAttribute('active', true);

    // generate container for carousel controls
    controlsContainer.innerHTML = `
      <button name="prev" aria-label="Previous" class="control-button" disabled><svg><use xlink:href="/icons/icons.svg#carrot"/></svg></button>
      <div class="pagination">
          <span class="index">1</span>
          <span class="of">of</span>
          <span class="total">${content.total}</span>
      </div>
      <button name="next" aria-label="Next" class="control-button"><svg><use xlink:href="/icons/icons.svg#carrot"/></svg></button>
    `;
    window.setTimeout(observeCarousel, 3000);
  }
}
