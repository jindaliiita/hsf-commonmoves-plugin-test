import Search from '../Search.js';

export default class CitySearch extends Search {
  city;

  constructor() {
    super();
    this.type = 'City';
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'City');
    params.set('SearchParameter', this.city);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    const entry = entries.find(([k]) => k.includes('city'));
    if (entry) [, this.city] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.city = params.get('SearchParameter');
  }
}
