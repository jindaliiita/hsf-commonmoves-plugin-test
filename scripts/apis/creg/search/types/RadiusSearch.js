import Search from '../Search.js';

export default class RadiusSearch extends Search {
  #lat;

  #lon;

  #distance;

  constructor() {
    super();
    this.type = 'Radius';
    Object.defineProperties(this, {
      lat: {
        enumerable: true,
        set: (value) => {
          this.#lat = `${parseFloat(`${value}`).toFixed(7)}`;
        },
        get: () => this.#lat,
      },
      lon: {
        enumerable: true,
        set: (value) => {
          this.#lon = `${parseFloat(`${value}`).toFixed(7)}`;
        },
        get: () => this.#lon,
      },
      distance: {
        enumerable: true,
        set: (value) => {
          this.#distance = `${value}`;
        },
        get: () => this.#distance,
      },
    });
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', this.type);
    params.set('Latitude', this.lat);
    params.set('Longitude', this.lon);
    params.set('Distance', this.distance);
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    let entry = entries.find(([k]) => k.includes('lat'));
    if (entry) [, this.lat] = entry;
    entry = entries.find(([k]) => k.includes('lon'));
    if (entry) [, this.lon] = entry;
    entry = entries.find(([k]) => k.includes('dist'));
    if (entry) [, this.distance] = entry;
  }
}
