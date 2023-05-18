import { setFilterValue } from '../filter-processor.js';

const CONFIG = {
  Address: 'CoverageZipcode',
  PostalCode: 'CoverageZipcode',
  Neighborhood: 'BID',
  School: 'BID',
  'School District': 'BID',
  MLSListingKey: 'ListingId',
};

function parseQueryString(queryString) {
  return queryString.split('&').reduce((resultObject, pair) => {
    const [key, value] = pair.split('=');
    resultObject[key] = decodeURIComponent(value.replace(/\+/g, '%20'));
    return resultObject;
  }, {});
}

export function getAttributes(result) {
  const query = parseQueryString(result.QueryString);
  query.BID = result.BID ?? '';
  const type = query.SearchType;
  const key = CONFIG[type];
  const output = {
    'search-input': result.displayText,
    'search-type': type,
    'search-parameter': query.SearchParameter,
  };
  if (Object.keys(CONFIG).includes(type)) {
    output[key] = query[key];
  }
  return output;
}

export function setSearchParams(target) {
  const searchParameter = target.getAttribute('search-parameter');
  const keyword = target.getAttribute('search-input');
  const type = target.getAttribute('search-type');
  let attr;
  setFilterValue('SearchType', type);
  setFilterValue('SearchInput', keyword);
  setFilterValue('SearchParameterOriginal', searchParameter);
  Object.keys(CONFIG).forEach((key) => {
    attr = CONFIG[key].toLowerCase();
    if (target.hasAttribute(attr)) {
      setFilterValue(CONFIG[key], target.getAttribute(attr));
    }
  });
}
