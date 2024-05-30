import {
  button, div, p, span,
} from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/aem.js';

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
  const content = await getContent(dataUrl);
  // generate carousel content from loaded data
  block.setAttribute('id', blockId);
  block.innerHTML = '';

  const titleElement = document.createElement('p');
  titleElement.innerText = title.trim();
  titleElement.classList.add('title');

  const controlsContainer = div({ class: 'controls-container' },
    div({ class: 'pagination' },
      span({ class: 'index' }, '1'),
      span({ class: 'of' }, 'of'),
      span({ class: 'total' }, content.total),
    ),
    button({
      name: 'prev', class: 'control-button', 'aria-label': 'Previous', disabled: true,
    },
    span({ class: 'icon icon-chevron-right-white' }),
    ),
    button({ name: 'next', class: 'control-button', 'aria-label': 'Next' },
      span({ class: 'icon icon-chevron-right-white' }),
    ),
  );
  decorateIcons(controlsContainer);

  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('carousel-content');

  block.replaceChildren(titleElement, slidesContainer, controlsContainer);

  if (content.data.length > 0) {
    [...content.data].forEach((row) => {
      if (!row.quote.startsWith('"')) {
        row.quote = `"${row.quote}`;
      }
      if (!row.quote.endsWith('"')) {
        row.quote = `${row.quote}"`;
      }
      const rowContent = div({ class: 'item' },
        p({ class: 'quote' }, row.quote),
        p({ class: 'author' }, row.author),
        p({ class: 'position' }, row.position),
      );
      slidesContainer.appendChild(rowContent);
    });
    slidesContainer.children[0].setAttribute('active', true);
    window.setTimeout(observeCarousel, 3000);
  }
}
