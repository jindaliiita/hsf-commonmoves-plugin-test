import Search from '../Search.js';

export default class NeighborhoodSearch extends Search {
  neighborhood;

  constructor() {
    super();
    this.type = 'Neighborhood';
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'Neighborhood');
    params.set('SearchParameter', this.neighborhood);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    const entry = entries.find(([k]) => k.includes('neighborhood'));
    if (entry) [, this.neighborhood] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.neighborhood = params.get('SearchParameter');
  }
}
