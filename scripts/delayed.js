// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';
import { getCookieValue, getEnvType } from './util.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

function loadAdobeLaunch() {
  const adobedtmSrc = {
    dev: 'https://assets.adobedtm.com/2079c5a4620d/addee6043c9b/launch-EN41458ac9f88145ac942b876e3362c32f-development.min.js',
    preview: 'https://assets.adobedtm.com/2079c5a4620d/addee6043c9b/launch-EN367ab3c0970e43a0afba6d1110494ef4-staging.min.js',
    live: 'https://assets.adobedtm.com/2079c5a4620d/addee6043c9b/launch-EN8919423a46da4e859aad8cef6f514471.min.js',
  };
  loadScript(adobedtmSrc[getEnvType()], {
    type: 'text/javascript',
    async: true,
  });
}

async function loadIDServlet() {
  const sessionID = getCookieValue('XSESSIONID');
  const options = {
    method: 'POST',
    body: `sameAs=%7B%22cregcontactid%22%3A%22${sessionID}`,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  };
  const url = '/bin/bhhs/graphIdServlet';
  const resp = await fetch(url, options);
  if (resp.ok) {
    const id = await resp.json();
    const idString = JSON.stringify(id);
    document.cookie = `consumerID=${idString}`;
  }
}

if (!window.location.host.includes('localhost')) loadAdobeLaunch();
if (!getCookieValue('consumerID')) {
  loadIDServlet();
}
