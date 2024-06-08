import { fetchPlaceholders } from './aem.js';
import { div, domEl } from './dom-helpers.js';

/**
 * Creates the standard Spinner Div.
 *
 * @returns {HTMLDivElement} the spinner div.
 */
export function getSpinner() {
  const spinner = document.createElement('div');
  spinner.classList.add('loading-spinner');
  spinner.innerHTML = '<span></span>';
  return spinner;
}

/**
 * Creates and displays a modal with the specified text.
 * @param {Object|String} content the content to show.
 * @param {String} content.title the title to show
 * @param {String} content.body the body to show
 */
export function showModal(content) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <p></p>
      <p class="button-container">
        <a rel="noopener" href="" tabindex="">OK</a>
      </p>
    </div>
  `;

  modal.querySelector('.modal-content p').innerHTML = content.body ? content.body : content;

  if (content.title) {
    const h3 = document.createElement('h3');
    h3.textContent = content.title;
    modal.querySelector('.modal-content').prepend(h3);
  }

  modal.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.overflowY = null;
    modal.remove();
  });
  document.body.style.overflowY = 'hidden';
  document.body.append(modal);
}

let sideModal;
let focusElement;

export function removeSideModal() {
  if (!sideModal) return;
  sideModal.parentNode.nextSibling.remove();
  sideModal.parentNode.remove();
  sideModal = null;
  document.body.classList.remove('disable-scroll');
  if (focusElement) focusElement.focus();
}

export async function showSideModal(content, decorateContent) {
  if (!sideModal) {
    const temp = div(
      domEl('aside', { class: 'side-modal' }, div()),
      div({ class: 'side-modal-overlay' }),
    );
    sideModal = temp.querySelector('.side-modal');
    document.body.append(temp);
  }
  const container = sideModal.querySelector('div');
  container.replaceChildren(...content);

  if (decorateContent) await decorateContent(container);

  // required delay for animation to work
  setTimeout(() => {
    document.body.classList.add('disable-scroll');
    sideModal.ariaExpanded = true;
  });

  focusElement = document.activeElement;
}

function createTextKey(text) {
  // create a key that can be used to look up the text in the placeholders
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  if (words.length > 5) {
    words.splice(5);
  }
  words.forEach((word, i) => {
    if (i > 0) {
      words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
  });
  return words.join('');
}

export async function i18nLookup(prefix) {
  const placeholders = await fetchPlaceholders(prefix);
  return (msg) => {
    if (placeholders[msg]) {
      return placeholders[msg];
    }
    if (placeholders[msg.toLowerCase()]) {
      return placeholders[msg.toLowerCase()];
    }
    const key = createTextKey(msg);
    if (placeholders[key]) {
      return placeholders[key];
    }
    return msg;
  };
}

/**
 * Retrieves the environment type based on the provided hostname.
 *
 * @param {string} [hostname=window.location.hostname] - The hostname to determine the environment.
 * @returns {string} The environment type ('live', 'preview', or 'dev').
 */
export function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'commonmoves.com': 'live',
    'www.commonmoves.com': 'live',
    'stage.commonmoves.com': 'preview',
    'preview.commonmoves.com': 'preview',
    'main--hsf-commonmoves--hlxsites.hlx.page': 'dev',
    'main--hsf-commonmoves--hlxsites.hlx.live': 'dev',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

/**
 * Retrieves the value of a cookie by its name.
 *
 * @param {string} cookieName - The name of the cookie to retrieve.
 * @returns {string|null} The value of the cookie, or null if not found.
 */
export function getCookieValue(cookieName) {
  const cookies = document.cookie.split(';');
  const foundCookie = cookies.find((cookie) => {
    const trimmedCookie = cookie.trim();
    return trimmedCookie.includes(cookieName);
  });
  if (foundCookie) {
    return foundCookie.split('=', 2)[1];
  }
  return null;
}

/**
 * Format a provided value to a shorthand number.
 * From: https://reacthustle.com/blog/how-to-convert-number-to-kmb-format-in-javascript
 * @param {String|Number} num the number to format
 * @param {Number} precision
 */
export function formatPrice(num, precision = 1) {
  if (Number.isNaN(Number.parseFloat(num))) {
    // eslint-disable-next-line no-param-reassign
    num = Number.parseFloat(num.replaceAll(/,/g, '').replace('$', ''));
  }
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'k', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    return (num / found.threshold).toFixed(precision) + found.suffix;
  }
  return num;
}

export function phoneFormat(num) {
  // Remove any non-digit characters from the string
  let phoneNum = num.replace(/\D/g, '');
  if (!phoneNum) {
    return '';
  }
  // Format the phoneNumber according to (XXX) XXX-XXXX
  phoneNum = phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  return phoneNum;
}

const Util = {
  getSpinner,
  showModal,
  i18nLookup,
  getEnvType,
  getCookieValue,
};

export default Util;
