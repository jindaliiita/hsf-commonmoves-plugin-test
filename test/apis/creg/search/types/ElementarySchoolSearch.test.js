import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import ElementarySchoolSearch from '../../../../../scripts/apis/creg/search/types/ElementarySchoolSearch.js';

describe('ElementarySchoolSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'Elementary School',
      });
      assert(search instanceof ElementarySchoolSearch, 'Created correct type.');
    });
    it('should populate ElementarySchool specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'elementary school',
        'elementary school': 'Elementary School on elm street',
      });
      assert(search instanceof ElementarySchoolSearch, 'Created correct type.');
      assert.equal(search.school, 'Elementary School on elm street', 'ElementarySchool set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new ElementarySchoolSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=ElementarySchool/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read School specific parameters', async () => {
      const search = new ElementarySchoolSearch();
      search.school = 'Elementary School on elm street';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=ElementarySchool/, 'Query string includes search type parameter.');
      assert.match(queryStr, /school=Elementary\+School\+on\+elm\+street/, 'Query string includes elementary school.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new ElementarySchoolSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read school specific parameters', async () => {
      const search = new ElementarySchoolSearch();
      search.school = 'Elementary School on elm street';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create elementary school search', async () => {
      const search = new ElementarySchoolSearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dElementary%20School\u0026SearchParameter\u003dElementary%20School%20on%20elm%20street'));
      assert(search instanceof ElementarySchoolSearch, 'Created correct type.');
      assert.equal(search.school, 'Elementary School on elm street', 'School was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have school search parameters', () => {
      const search = new ElementarySchoolSearch();
      search.school = 'Elementary School on elm street';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=ElementarySchool/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=Elementary\+School\+on\+elm\+street/, 'Query string includes Search parameter structure.');
    });
  });
});
