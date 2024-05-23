import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import CitySearch from '../../../../../scripts/apis/creg/search/types/CitySearch.js';

describe('CitySearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'City',
      });
      assert(search instanceof CitySearch, 'Created correct type.');
    });
    it('should populate City specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'city',
        city: 'Nowhere, NO',
      });
      assert(search instanceof CitySearch, 'Created correct type.');
      assert.equal(search.city, 'Nowhere, NO', 'City set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new CitySearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=City/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read city specific parameters', async () => {
      const search = new CitySearch();
      search.city = 'Nowhere, NO';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=City/, 'Query string includes search type parameter.');
      assert.match(queryStr, /city=Nowhere%2C\+NO/, 'Query string includes city.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new CitySearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read city specific parameters', async () => {
      const search = new CitySearch();
      search.city = 'Nowhere, NO';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create city search', async () => {
      const search = new CitySearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dCity\u0026SearchParameter\u003dNowhere%2C%20NO'));
      assert(search instanceof CitySearch, 'Created correct type.');
      assert.equal(search.city, 'Nowhere, NO', 'City was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have city search parameters', () => {
      const search = new CitySearch();
      search.city = 'Nowhere, NO';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=City/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=Nowhere%2C\+NO/, 'Query string includes Search parameter structure.');
    });
  });
});
