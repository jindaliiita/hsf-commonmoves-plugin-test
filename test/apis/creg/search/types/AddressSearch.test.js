import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import AddressSearch from '../../../../../scripts/apis/creg/search/types/AddressSearch.js';

describe('AddressSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'Address',
      });
      assert(search instanceof AddressSearch, 'Created correct type.');
    });
    it('should populate Address specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'address',
        address: '123 Elm Street, Nowhere, NO 12345',
      });
      assert(search instanceof AddressSearch, 'Created correct type.');
      assert.equal(search.address, '123 Elm Street, Nowhere, NO 12345', 'Address set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new AddressSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=Address/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read address specific parameters', async () => {
      const search = new AddressSearch();
      search.address = '123 Elm Street, Nowhere, NO 12345';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=Address/, 'Query string includes search type parameter.');
      assert.match(queryStr, /address=123\+Elm\+Street%2C\+Nowhere%2C\+NO\+12345/, 'Query string includes address.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new AddressSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read address specific parameters', async () => {
      const search = new AddressSearch();
      search.address = '123 Elm Street, Nowhere, NO 12345';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create address search', async () => {
      const search = new AddressSearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dAddress\u0026SearchParameter\u003d123%20Elm%20Street%2C%20Nowhere%2C%20NO%2012345'));
      assert(search instanceof AddressSearch, 'Created correct type.');
      assert.equal(search.address, '123 Elm Street, Nowhere, NO 12345', 'Address was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have address search parameters', () => {
      const search = new AddressSearch();
      search.address = '123 Elm Street, Nowhere, NO 12345';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=Address/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=123\+Elm\+Street%2C\+Nowhere%2C\+NO\+12345/, 'Query string includes Search parameter structure.');
    });
  });
});
