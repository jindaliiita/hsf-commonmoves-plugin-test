import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import RadiusSearch from '../../../../../scripts/apis/creg/search/types/RadiusSearch.js';
import BoxSearch from '../../../../../scripts/apis/creg/search/types/BoxSearch.js';

describe('RadiusSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'Radius',
      });
      assert(search instanceof RadiusSearch, 'Created correct type.');
    });

    it('should populate Radius specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'radius',
        lat: 75.987654321,
        longitude: -101.123456789,
        dist: 5,
      });
      assert(search instanceof RadiusSearch, 'Created correct type.');
      assert.equal(search.lat, '75.9876543', 'Longitude set.');
      assert.equal(search.lon, '-101.1234568', 'Latitude set.');
      assert.equal(search.distance, '5', 'Distance set.');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new RadiusSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=Radius/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });

    it('should read radius specific parameters', async () => {
      const search = new RadiusSearch();
      search.lat = 75.987654321;
      search.lon = -101.123456789;
      search.distance = 10;

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=Radius/, 'Query string includes search type parameter.');
      assert.match(queryStr, /lat=75.9876543/, 'Query string includes lat.');
      assert.match(queryStr, /lon=-101.1234568/, 'Query string includes lon.');
      assert.match(queryStr, /distance=10/, 'Query string includes distance');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new BoxSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });

    it('should read radius specific parameters', async () => {
      const search = new RadiusSearch();
      search.lat = 75.987654321;
      search.lon = -101.123456789;
      search.distance = 10;
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have Radius search parameters', () => {
      const search = new RadiusSearch();
      search.lat = 75.987654321;
      search.lon = -101.123456789;
      search.distance = 10;
      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=Radius/, 'Query string includes search type.');
      assert.match(queryStr, /Latitude=75.9876543/, 'Query string includes lat.');
      assert.match(queryStr, /Longitude=-101.1234568/, 'Query string includes lon.');
      assert.match(queryStr, /Distance=10/, 'Query string includes distance');
    });
  });
});
