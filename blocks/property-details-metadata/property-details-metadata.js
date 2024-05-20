import { getDetails, getEconomicDetails } from '../../scripts/apis/creg/creg.js';

const keys = [
  'ListPriceUS',
  'StreetName',
  'City',
  'StateOrProvince',
  'PostalCode',
  'Latitude',
  'Longitude',
  'LotSizeAcres',
  'LotSizeSquareFeet',
  'LivingAreaUnits',
  'Media',
  'SmallMedia',
  'PropId',
  'OpenHouses',
  'CourtesyOf',
];

function pick(obj, ...args) {
  return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), { });
}

function getPropIdFromPath() {
  const url = window.location.pathname;
  const idx = url.indexOf('pid-') + 'pid-'.length;
  return url.substring(idx);
}

async function getPropertyByPropId(propId) {
  const resp = await getDetails(propId);
  return resp[0];
}

async function getSocioEconomicData(latitude, longitude) {
  const resp = await getEconomicDetails(latitude, longitude);
  return resp[0];
}

export default async function decorate(block) {
  let property = {};
  let socioEconomicData = {};
  const propId = '370882966';
  getPropIdFromPath();
  const propertyData = await getPropertyByPropId(propId);
  if (propertyData) {
    property = pick(propertyData, ...keys);
    if (property.Latitude && property.Longitude) {
      const socioEconData = await getSocioEconomicData(property.Latitude, property.Longitude);
      if (socioEconData) {
        socioEconomicData = socioEconData;
      }
    }
  }
  window.property = property;
  window.socioEconomicData = socioEconomicData;
  block.remove();
}
