import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import PostalCodeSearch from '../../../../../scripts/apis/creg/search/types/PostalCodeSearch.js';

describe('PostalCodeSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'postal code',
      });
      assert(search instanceof PostalCodeSearch, 'Created correct type from postal code.');
    });
    it('should populate PostalCode specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'postal Code',
        'postAl coDe': '12345',
      });
      assert(search instanceof PostalCodeSearch, 'Created correct type.');
      assert.equal(search.code, '12345', 'PostalCode set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new PostalCodeSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=PostalCode/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read postal code specific parameters', async () => {
      const search = new PostalCodeSearch();
      search.code = '12345';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=PostalCode/, 'Query string includes search type parameter.');
      assert.match(queryStr, /code=12345/, 'Query string includes postal code.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new PostalCodeSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read postal code specific parameters', async () => {
      const search = new PostalCodeSearch();
      search.code = '12345';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create Postal Code search', async () => {
      const search = new PostalCodeSearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dPostalCode\u0026CoverageZipcode\u003d12345'));
      assert(search instanceof PostalCodeSearch, 'Created correct type.');
      assert.equal(search.code, '12345', 'Postal Code was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have postal code search parameters', () => {
      const search = new PostalCodeSearch();
      search.code = '12345';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=PostalCode/, 'Query string includes search type.');
      assert.match(queryStr, /CoverageZipcode=12345/, 'Query string includes Search parameter structure.');
    });
  });
});
