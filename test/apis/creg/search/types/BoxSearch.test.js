import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import BoxSearch from '../../../../../scripts/apis/creg/search/types/BoxSearch.js';

describe('BoxSearch', () => {
  describe('create from block config', () => {
    it('should have defaults', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'Box',
      });
      assert(search instanceof BoxSearch, 'Created correct type.');
    });

    it('should populate Box specific values', async () => {
      const search = await Search.fromBlockConfig({
        'search type': 'box',
        'min lat': '75.987654321',
        'maximum latitude': '76.987654321',
        'minimum long': '-100.123456789',
        'max longitude': '-101.123456789',
      });
      assert(search instanceof BoxSearch, 'Created correct type.');
      assert.equal(search.minLat, '75.9876543', 'Minimum Latitude set.');
      assert.equal(search.maxLat, '76.9876543', 'Maximum Latitude set.');
      assert.equal(search.minLon, '-100.1234568', 'Minimum Longitude set.');
      assert.equal(search.maxLon, '-101.1234568', 'Maximum Longitude set.');
    });
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new BoxSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=Box/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });

    it('should read box specific parameters', async () => {
      const search = new BoxSearch();
      search.minLat = 75.987654321;
      search.maxLat = 76.987654321;
      search.minLon = -100.123456789;
      search.maxLon = -101.123456789;

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=Box/, 'Query string includes search type parameter.');

      assert.match(queryStr, /minLat=75.9876543/, 'Query string includes min lat.');
      assert.match(queryStr, /maxLat=76.9876543/, 'Query string includes max lat.');
      assert.match(queryStr, /minLon=-100.1234568/, 'Query string includes min lon.');
      assert.match(queryStr, /maxLon=-101.1234568/, 'Query string includes max lon.');
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

    it('should read box specific parameters', async () => {
      const search = new BoxSearch();
      search.minLat = 75.987654321;
      search.maxLat = 76.987654321;
      search.minLon = -100.123456789;
      search.maxLon = -101.123456789;
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have Box search parameters', () => {
      const search = new BoxSearch();
      search.minLat = 75.987654321;
      search.maxLat = 76.987654321;
      search.minLon = -100.123456789;
      search.maxLon = -101.123456789;

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=Map/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=%7B%22type%22%3A%22FeatureCollection%22%2C%22features%22%3A%5B%7B%22type%22%3A%22Feature%22%2C%/, 'Query string includes Base structure.');
      assert.match(queryStr, /22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B%22/, 'Query string includes geometry beginning.');
      assert.match(queryStr, /%22%3A%5B%5B%5B%22-100.1234568%22%2C%2275.9876543/, 'Query string includes first minLon/minLat point.');
      assert.match(queryStr, /-100.1234568%22%2C%2276.9876543/, 'Query string includes minLon/maxLat point.');
      assert.match(queryStr, /-101.1234568%22%2C%2276.9876543/, 'Query string includes maxLon/maxLat point.');
      assert.match(queryStr, /-101.1234568%22%2C%2275.9876543/, 'Query string includes maxLon/minLat point.');
      assert.match(queryStr, /-100.1234568%22%2C%2275.9876543%22%5D%5D%5D%7D%7D%5D%7D/, 'Query string includes close-the-box minLon/minLat point.');
    });
  });
});
