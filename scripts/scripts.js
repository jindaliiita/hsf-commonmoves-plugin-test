import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
} from './lib-franklin.js';

export const LIVEBY_API = 'https://api.liveby.com/v1/';

export const BREAKPOINTS = {
  small: window.matchMedia('(min-width: 600px)'),
  medium: window.matchMedia('(min-width: 900px)'),
  large: window.matchMedia('(min-width: 1200px)'),
};

const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'bhhs-commonmoves'; // add your RUM generation information here

function preloadHeroImage(picture) {
  const src = [...picture.querySelectorAll('source')]
    .filter((source) => source.getAttribute('type') === 'image/webp')
    .find((source) => {
      const media = source.getAttribute('media');
      return !media || window.matchMedia(media).matches;
    });

  const link = document.createElement('link');
  link.setAttribute('rel', 'preload');
  link.setAttribute('fetchpriority', 'high');
  link.setAttribute('as', 'image');
  link.setAttribute('href', src.getAttribute('srcset'));
  link.setAttribute('type', src.getAttribute('type'));
  document.head.append(link);
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
    preloadHeroImage(picture);
  }
}

function buildLiveByMetadata(main) {
  const community = getMetadata('liveby-community');
  if (community) {
    const section = document.createElement('div');
    section.append(buildBlock('liveby-metadata', { elems: [] }));
    main.prepend(section);
    main.classList.add('liveby-community');
    loadCSS(`${window.hlx.codeBasePath}/styles/community-styles.css`);

    const attribution = document.createElement('div');
    attribution.append(buildBlock('liveby-attribution', { elems: [] }));
    main.append(attribution);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildLiveByMetadata(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Build Floating image block
 * @param {Element} main The container element
 */
function buildFloatingImages(main) {
  const sections = main.querySelectorAll('.section.image-right .default-content-wrapper, .section.image-left .default-content-wrapper');
  if (sections) {
    sections.forEach((section) => {
      const image = document.createElement('div');
      image.classList.add('image');
      const picture = section.querySelector('picture');
      if (picture) {
        // Remove the <p> tag wrapper;
        const parent = picture.parentElement;
        image.prepend(picture);
        parent.remove();
      }

      const content = section.children;
      const contentContainer = document.createElement('div');
      contentContainer.append(...content);
      const left = document.createElement('div');
      left.classList.add('content');
      left.append(contentContainer);
      section.append(image, left);
    });
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  buildFloatingImages(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();
  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
