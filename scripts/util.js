import { fetchPlaceholders } from './aem.js';

/**
 * Creates the standard Spinner Div.
 *
 * @returns {HTMLDivElement} the spinner div.
 */
export function getSpinner() {
  const div = document.createElement('div');
  div.classList.add('loading-spinner');
  div.innerHTML = '<span></span>';
  return div;
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

/*
  * Returns the environment type based on the hostname.
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
};

export default Util;
