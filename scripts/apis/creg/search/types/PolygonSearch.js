import Search from '../Search.js';

export default class PolygonSearch extends Search {
  #points = [];

  constructor() {
    super();
    this.type = 'Polygon';
    Object.defineProperties(this, {
      points: {
        enumerable: true,
        set: (value) => {
          this.#points.length = 0;
          if (value instanceof Array) {
            value.forEach((item) => {
              const { lat, lon } = item;
              if (lat && lon) {
                this.#points.push({ lat, lon });
              }
            });
          }
        },
        get: () => structuredClone(this.#points),
      },
    });
  }

  /**
   * Add a point to the list of points in this Polygon search.
   * @param {Object} point the point
   * @param {number|String} point.lat the latitude of the point
   * @param {number|String} point.lon the longitude of the point
   */
  addPoint(point) {
    const { lat, lon } = point;
    if (lat && lon) {
      this.#points.push({ lat, lon });
    }
  }

  asCregURLSearchParameters() {
    const coordinates = [];
    this.points.forEach((p) => {
      coordinates.push([p.lon, p.lat]);
    });
    coordinates.push([this.points[0].lon, this.points[0].lat]);
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'Map');
    const obj = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      }],
    };
    params.set('SearchParameter', JSON.stringify(obj));
    return params;
  }

  asURLSearchParameters() {
    const params = super.asURLSearchParameters();
    params.delete('points');
    this.#points.forEach((p) => {
      params.append('point', `${p.lat},${p.lon}`);
    });
    return params;
  }

  populateFromURLSearchParameters(params) {
    const points = params.getAll('point');
    params.delete('point');
    super.populateFromURLSearchParameters(params);
    points.forEach((p) => {
      const [lat, lon] = p.split(',');
      this.addPoint({ lat, lon });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  populateFromConfig() {
    throw new Error('PolygonSearch cannot be used in Block config.');
  }
}
