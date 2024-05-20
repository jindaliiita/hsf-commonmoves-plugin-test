import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import Search from '../../../../../scripts/apis/creg/search/Search.js';
import PolygonSearch from '../../../../../scripts/apis/creg/search/types/PolygonSearch.js';

describe('PolygonSearch', () => {
  it('cannot be created create from block config', async () => {
    await assert.rejects(Search.fromBlockConfig({
      'search type': 'Polygon',
    }), Error, 'Does not create instance.');
  });

  it('can add a point', () => {
    const search = new PolygonSearch();
    search.addPoint('Not An object.');
    assert.deepStrictEqual(search.points, [], 'Ignored invalid object.');
    search.addPoint({});
    assert.deepStrictEqual(search.points, [], 'Ignored invalid object.');
    search.addPoint([]);
    assert.deepStrictEqual(search.points, [], 'Ignored invalid object.');
    search.addPoint({ lat: '123' });
    assert.deepStrictEqual(search.points, [], 'Ignored invalid object.');
    search.addPoint({ lon: '123' });
    assert.deepStrictEqual(search.points, [], 'Ignored invalid object.');

    search.addPoint({ lat: '123', lon: '123' });
    assert.deepStrictEqual(search.points, [{ lat: '123', lon: '123' }], 'Ignored invalid object.');
  });

  describe('to/from URL Search Parameters', () => {
    it('should have defaults', async () => {
      const search = new PolygonSearch();
      const queryStr = search.asURLSearchParameters().toString();

      assert.match(queryStr, /type=Polygon/, 'Query string includes search type parameter.');
      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });

    it('should read Polygon specific parameters', async () => {
      const search = new PolygonSearch();
      search.addPoint({ lat: '42.14299778443187', lon: '-70.99324744939803' });
      search.addPoint({ lat: '42.038540372268336', lon: '-71.10242408514021' });
      search.addPoint({ lat: '41.941061865983954', lon: '-70.96578162908553' });
      search.addPoint({ lat: '41.928291852269396', lon: '-70.72339576482771' });
      search.addPoint({ lat: '42.01150632664794', lon: '-70.67807716131209' });
      search.addPoint({ lat: '42.10785815410172', lon: '-70.74536842107771' });
      search.addPoint({ lat: '42.16946694504556', lon: '-70.71515601873396' });

      const queryStr = search.asURLSearchParameters().toString();
      assert.match(queryStr, /type=Polygon/, 'Query string includes search type parameter.');

      assert.match(queryStr, /point=42.14299778443187%2C-70.99324744939803/, 'Query string includes first point');
      assert.match(queryStr, /point=42.038540372268336%2C-71.10242408514021/, 'Query string includes second point');
      assert.match(queryStr, /point=41.941061865983954%2C-70.96578162908553/, 'Query string includes third point');
      assert.match(queryStr, /point=41.928291852269396%2C-70.72339576482771/, 'Query string includes fourth point');
      assert.match(queryStr, /point=42.01150632664794%2C-70.67807716131209/, 'Query string includes fifth point');
      assert.match(queryStr, /point=42.10785815410172%2C-70.74536842107771/, 'Query string includes sixth point');
      assert.match(queryStr, /point=42.16946694504556%2C-70.71515601873396/, 'Query string includes seventh point');

      const created = await Search.fromQueryString(queryStr);
      assert.deepStrictEqual(created, search, 'Object was parsed from query string correctly.');
    });
  });

  describe('to/from JSON', () => {
    it('should have defaults', async () => {
      const search = new PolygonSearch();
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });

    it('should read polygon specific parameters', async () => {
      const points = [
        { lat: '42.14299778443187', lon: '-70.99324744939803' },
        { lat: '42.038540372268336', lon: '-71.10242408514021' },
        { lat: '41.941061865983954', lon: '-70.96578162908553' },
        { lat: '41.928291852269396', lon: '-70.72339576482771' },
        { lat: '42.01150632664794', lon: '-70.67807716131209' },
        { lat: '42.10785815410172', lon: '-70.74536842107771' },
        { lat: '42.16946694504556', lon: '-70.71515601873396' },
      ];

      const search = new PolygonSearch();
      search.points = points;
      const created = await Search.fromJSON(JSON.parse(JSON.stringify(search)));
      assert.deepStrictEqual(created, search, 'To/From JSON correct.');
    });
  });

  describe('to CREG URL Search Parameters', () => {
    it('should have Polygon search parameters', () => {
      const points = [
        { lat: '42.14299778443187', lon: '-70.99324744939803' },
        { lat: '42.038540372268336', lon: '-71.10242408514021' },
        { lat: '41.941061865983954', lon: '-70.96578162908553' },
        { lat: '41.928291852269396', lon: '-70.72339576482771' },
        { lat: '42.01150632664794', lon: '-70.67807716131209' },
        { lat: '42.10785815410172', lon: '-70.74536842107771' },
        { lat: '42.16946694504556', lon: '-70.71515601873396' },
      ];
      const search = new PolygonSearch();
      search.points = points;

      const queryStr = search.asCregURLSearchParameters().toString();
      assert.match(queryStr, /SearchType=Map/, 'Query string includes search type.');
      assert.match(queryStr, /SearchParameter=%7B%22type%22%3A%22FeatureCollection%22%2C%22features%22%3A%5B%7B%22type%22%3A%22Feature%22%2C%/, 'Query string includes Base structure.');
      assert.match(queryStr, /22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B%22/, 'Query string includes geometry beginning.');
      assert.match(queryStr, /%22%3A%5B%5B%5B%22-70.99324744939803%22%2C%2242.14299778443187/, 'Query string includes first point.');
      assert.match(queryStr, /-71.10242408514021%22%2C%2242.038540372268336/, 'Query string includes second point.');
      assert.match(queryStr, /-70.96578162908553%22%2C%2241.941061865983954/, 'Query string includes third point.');
      assert.match(queryStr, /-70.72339576482771%22%2C%2241.928291852269396/, 'Query string includes fourth point.');
      assert.match(queryStr, /-70.67807716131209%22%2C%2242.01150632664794/, 'Query string includes fifth point.');
      assert.match(queryStr, /-70.74536842107771%22%2C%2242.10785815410172/, 'Query string includes sixth point.');
      assert.match(queryStr, /-70.71515601873396%22%2C%2242.16946694504556/, 'Query string includes seventh point.');
      assert.match(queryStr, /-70.99324744939803%22%2C%2242.14299778443187%22%5D%5D%5D%7D%7D%5D%7D/, 'Query string includes closing point.');
    });
  });
});
