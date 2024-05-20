import Search from '../Search.js';

export default class PostalCodeSearch extends Search {
  code;

  constructor() {
    super();
    this.type = 'PostalCode';
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'PostalCode');
    params.set('CoverageZipcode', this.code);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    const entry = entries.find(([k]) => k.match(/postal.*code/i));
    if (entry) [, this.code] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.code = params.get('CoverageZipcode');
  }
}
