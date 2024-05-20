import Search from '../Search.js';

/**
 * Special case of search - not to be confused with searching for a specific property based on the listing ID.
 * MLS Key searches require the context of the ID to validate franchisee metadata (e.g. vanityDomain)
 */
export default class MLSListingKeySearch extends Search {
  listingId;

  context;

  constructor() {
    super();
    this.type = 'MLSListingKey';
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'MLSListingKey');
    params.set('ListingId', this.listingId);
    params.set('SearchParameter', this.context);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    let entry = entries.find(([k]) => k.match(/mls.*listing.*key/i));
    if (entry) [, this.listingId] = entry;
    entry = entries.find(([k]) => k.match(/context/));
    if (entry) [, this.context] = entry;
  }

  populateFromSuggestion(params) {
    super.populateFromSuggestion(params);
    this.listingId = params.get('ListingId');
    this.context = params.get('SearchParameter');
  }
}
