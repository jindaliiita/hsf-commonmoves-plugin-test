import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import HighSchoolSearch from '../../../../../scripts/apis/creg/search/types/HighSchoolSearch.js';

describe('HighSchoolSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'High School',
      });
      assert(search instanceof HighSchoolSearch, 'Created correct type.');
    });
    it('should populate HighSchool specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'High School',
        'high school': 'High School on elm street',
      });
      assert(search instanceof HighSchoolSearch, 'Created correct type.');
      assert.equal(search.school, 'High School on elm street', 'HighSchool set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new HighSchoolSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=HighSchool/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read school specific parameters', async () => {
      const search = new HighSchoolSearch();
      search.school = 'High School on elm street';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=HighSchool/, 'Query string includes search type parameter.');
      assert.match(queryStr, /school=High\+School\+on\+elm\+street/, 'Query string includes school.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new HighSchoolSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read school specific parameters', async () => {
      const search = new HighSchoolSearch();
      search.school = 'High School on elm street';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create high school search', async () => {
      const search = new HighSchoolSearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dHigh%20School\u0026SearchParameter\u003dHigh%20School%20on%20elm%20street'));
      assert(search instanceof HighSchoolSearch, 'Created correct type.');
      assert.equal(search.school, 'High School on elm street', 'School was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have school search parameters', () => {
      const search = new HighSchoolSearch();
      search.school = 'High School on elm street';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=HighSchool/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=High\+School\+on\+elm\+street/, 'Query string includes Search parameter structure.');
    });
  });
});
