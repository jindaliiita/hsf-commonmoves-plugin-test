import Search from '../Search.js';

export default class SchoolDistrictSearch extends Search {
  district;

  constructor() {
    super();
    this.type = 'SchoolDistrict';
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'SchoolDistrict');
    params.set('SearchParameter', this.district);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    const entry = entries.find(([k]) => k.match(/school.*district/i));
    if (entry) [, this.district] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.district = params.get('SearchParameter');
  }
}
