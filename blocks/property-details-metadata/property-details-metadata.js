const urlParams = new URLSearchParams(window.location.search);
export const DOMAIN = urlParams.get('env') === 'stage' ? 'ignite-staging.bhhs.com' : 'www.bhhs.com';
const API_URL = `https://${DOMAIN}/bin/bhhs`;

async function getPropertyByPropId(propId) {
  const endpoint = `${API_URL}/CregPropertySearchServlet?SearchType=ListingId&ListingId=${propId}&ListingStatus=1,2,3&ApplicationType=FOR_SALE,FOR_RENT,RECENTLY_SOLD`;
  const resp = await fetch(endpoint);
  if (resp.ok) {
    const data = await resp.json();
    /* eslint-disable-next-line no-underscore-dangle */
    return data;
  }
  /* eslint-disable-next-line no-console */
  console.log('Unable to retrieve property information.');
  return undefined;
}

async function getSocioEconomicData(latitude, longitude) {
  const endpoint = `${API_URL}/pdp/socioEconomicDataServlet?latitude=${latitude}&longitude=${longitude}`;
  const resp = await fetch(endpoint);
  if (resp.ok) {
    const data = await resp.json();
    /* eslint-disable-next-line no-underscore-dangle */
    return data;
  }
  /* eslint-disable-next-line no-console */
  console.log('Unable to retrieve socioeconomic data.');
  return undefined;
}

function getPropIdFromPath() {
  const url = window.location.pathname;
  const idx = url.indexOf('pid-') + 'pid-'.length;
  return url.substring(idx);
}

export default async function decorate(block) {
  const propId = getPropIdFromPath();
  const propertyData = await getPropertyByPropId(propId);
  
  block.remove();
}