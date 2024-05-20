import Search from '../Search.js';

export default class SchoolSearch extends Search {
  school;

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', this.type);
    params.set('SearchParameter', this.school);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    const entry = entries.find(([k]) => k.includes('school'));
    if (entry) [, this.school] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.school = params.get('SearchParameter');
  }
}
