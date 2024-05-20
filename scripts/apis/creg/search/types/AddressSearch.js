import Search from '../Search.js';

export default class AddressSearch extends Search {
  address;

  constructor() {
    super();
    this.type = 'Address';
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'Address');
    params.set('SearchParameter', this.address);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    const entry = entries.find(([k]) => k.includes('address'));
    if (entry) [, this.address] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.address = params.get('SearchParameter');
  }
}
