// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript, fetchPlaceholders } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// fetch placeholders file
const placeholders = await fetchPlaceholders();

/*
  * Returns the environment type based on the hostname.
*/
function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'commonmoves.com': 'live',
    'www.commonmoves.com': 'live',
    'main--hsf-commonmoves--hlxsites.hlx.page': 'dev',
    'main--hsf-commonmoves--hlxsites.hlx.live': 'dev',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

async function loadAdobeLaunch() {
  const adobedtmSrc = {
    dev: 'https://assets.adobedtm.com/launch-EN8919423a46da4e859aad8cef6f514471.min.js',
    preview: 'https://assets.adobedtm.com/launch-EN8919423a46da4e859aad8cef6f514471.min.js',
    live: 'https://assets.adobedtm.com/launch-EN8919423a46da4e859aad8cef6f514471.min.js',
  };
  await loadScript(adobedtmSrc[getEnvType()], {
    type: 'text/javascript',
    async: true,
  });
}

// OneTrust Cookies Consent Notice start
if (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost')) {
  const otId = placeholders.onetrustid;
  if (otId) {
    loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': `${otId}`,
    });

    window.OptanonWrapper = () => {
    };
  }

  const allButtons = document.querySelectorAll('a.button');
  allButtons.forEach((button) => {
    if (button.getAttribute('href').includes('cookie-policy')) {
      button.addEventListener('click', (e) => {
        // eslint-disable-next-line no-undef
        OneTrust.ToggleInfoDisplay();
        e.preventDefault();
      });
    }
  });
}

if (!window.location.host.includes('localhost')) await loadAdobeLaunch();
