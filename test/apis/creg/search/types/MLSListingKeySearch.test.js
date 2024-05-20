import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import MLSListingKeySearch from '../../../../../scripts/apis/creg/search/types/MLSListingKeySearch.js';

describe('MLSListingKeySearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'MLS Listing Key',
      });
      assert(search instanceof MLSListingKeySearch, 'Created correct type.');
    });
    it('should populate MLS Listing Key specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'MLS listing key',
        'MLS Listing Key': '12345678',
        context: 'Boston, MA',
      });
      assert(search instanceof MLSListingKeySearch, 'Created correct type.');
      assert.equal(search.listingId, '12345678', 'MLS Listing Key set');
      assert.equal(search.context, 'Boston, MA');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new MLSListingKeySearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=MLSListingKey/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read address specific parameters', async () => {
      const search = new MLSListingKeySearch();
      search.listingId = '12345678';
      search.context = 'Boston, MA';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=MLSListingKey/, 'Query string includes search type parameter.');
      assert.match(queryStr, /listingId=12345678/, 'Query string includes listing id.');
      assert.match(queryStr, /context=Boston%2C\+MA/, 'Query string includes context.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new MLSListingKeySearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read address specific parameters', async () => {
      const search = new MLSListingKeySearch();
      search.listingId = '12345678';
      search.context = 'Boston, MA';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create MLS search', async () => {
      const search = new MLSListingKeySearch();
      search.populateFromSuggestion(new URLSearchParams('ListingId=12345678\u0026SearchType\u003dMLSListingKey\u0026SearchParameter\u003dBoston%2C%20MA'));

      assert(search instanceof MLSListingKeySearch, 'Created correct type.');
      assert.equal(search.listingId, '12345678', 'Listing id was correct.');
      assert.equal(search.context, 'Boston, MA', 'Context was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have address search parameters', () => {
      const search = new MLSListingKeySearch();
      search.listingId = '12345678';
      search.context = 'Boston, MA';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=MLSListingKey/, 'Query string includes search type.');
      assert.match(queryStr, /ListingId=12345678/, 'Query string includes listing id');
      assert.match(queryStr, /SearchParameter=Boston%2C\+MA/, 'Query string includes Search parameter structure.');
    });
  });
});
