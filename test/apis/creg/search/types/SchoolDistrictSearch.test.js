import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import SchoolDistrictSearch from '../../../../../scripts/apis/creg/search/types/SchoolDistrictSearch.js';

describe('SchoolDistrictSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'School District',
      });
      assert(search instanceof SchoolDistrictSearch, 'Created correct type.');
    });
    it('should populate SchoolDistrict specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'school district',
        'school district': 'School District in Nowhere, NO',
      });
      assert(search instanceof SchoolDistrictSearch, 'Created correct type.');
      assert.equal(search.district, 'School District in Nowhere, NO', 'School District set');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new SchoolDistrictSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=SchoolDistrict/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
    it('should read school district specific parameters', async () => {
      const search = new SchoolDistrictSearch();
      search.district = 'School District in Nowhere, NO';

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=SchoolDistrict/, 'Query string includes search type parameter.');
      assert.match(queryStr, /district=School\+District\+in\+Nowhere%2C\+NO/, 'Query string includes school district.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new SchoolDistrictSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
    it('should read school district specific parameters', async () => {
      const search = new SchoolDistrictSearch();
      search.district = 'School District in Nowhere, NO';
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('from suggestion results', () => {
    it('should create school district search', async () => {
      const search = new SchoolDistrictSearch();
      search.populateFromSuggestion(new URLSearchParams('SearchType\u003dSchoolDistrict\u0026SearchParameter\u003dSchool%20District%20in%20Nowhere%2C%20NO'));
      assert(search instanceof SchoolDistrictSearch, 'Created correct type.');
      assert.equal(search.district, 'School District in Nowhere, NO', 'School district was correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have school district search parameters', () => {
      const search = new SchoolDistrictSearch();
      search.district = 'School District in Nowhere, NO';

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=SchoolDistrict/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=School\+District\+in\+Nowhere%2C\+NO/, 'Query string includes Search parameter structure.');
    });
  });
});
