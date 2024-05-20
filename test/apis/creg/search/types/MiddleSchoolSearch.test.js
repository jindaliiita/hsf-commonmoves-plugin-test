import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import MiddleSchoolSearch from '../../../../../scripts/apis/creg/search/types/MiddleSchoolSearch.js';

describe('MiddleSchoolSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'Middle School',
      });
      assert(search instanceof MiddleSchoolSearch, 'Created correct type.');
    });
    it('should populate MiddleSchool specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'middle School',
        'middle school': 'Middle School on elm street',
      });
      assert(search instanceof MiddleSchoolSearch, 'Created correct type.');
      assert.equal(search.school, 'Middle School on elm street', 'MiddleSchool set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new MiddleSchoolSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=MiddleSchool/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read school specific parameters', async () => {
      const search = new MiddleSchoolSearch();
      search.school = 'Middle School on elm street';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=MiddleSchool/, 'Query string includes search type parameter.');
      assert.match(queryStr, /school=Middle\+School\+on\+elm\+street/, 'Query string includes school.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new MiddleSchoolSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read school specific parameters', async () => {
      const search = new MiddleSchoolSearch();
      search.school = 'Middle School on elm street';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create middle school search', async () => {
      const search = new MiddleSchoolSearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dMiddle%20School\u0026SearchParameter\u003dMiddle%20School%20on%20elm%20street'));
      assert(search instanceof MiddleSchoolSearch, 'Created correct type.');
      assert.equal(search.school, 'Middle School on elm street', 'School was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have school search parameters', () => {
      const search = new MiddleSchoolSearch();
      search.school = 'Middle School on elm street';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=MiddleSchool/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=Middle\+School\+on\+elm\+street/, 'Query string includes Search parameter structure.');
    });
  });
});
