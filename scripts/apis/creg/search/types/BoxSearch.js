import Search from '../Search.js';

export default class BoxSearch extends Search {
  #minLat;

  #maxLat;

  #minLon;

  #maxLon;

  constructor() {
    super();
    this.type = 'Box';
    Object.defineProperties(this, {
      minLat: {
        enumerable: true,
        set: (value) => {
          this.#minLat = `${parseFloat(`${value}`).toFixed(7)}`;
        },
        get: () => this.#minLat,
      },
      maxLat: {
        enumerable: true,
        set: (value) => {
          this.#maxLat = `${parseFloat(`${value}`).toFixed(7)}`;
        },
        get: () => this.#maxLat,
      },
      minLon: {
        enumerable: true,
        set: (value) => {
          this.#minLon = `${parseFloat(`${value}`).toFixed(7)}`;
        },
        get: () => this.#minLon,
      },
      maxLon: {
        enumerable: true,
        set: (value) => {
          this.#maxLon = `${parseFloat(`${value}`).toFixed(7)}`;
        },
        get: () => this.#maxLon,
      },
    });
  }

  asCregURLSearchParameters() {
    const params = super.asCregURLSearchParameters();
    params.set('SearchType', 'Map');
    const obj = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [this.minLon, this.minLat], // Bottom left
            [this.minLon, this.maxLat], // Top left
            [this.maxLon, this.maxLat], // Top right
            [this.maxLon, this.minLat], // Bottom right
            [this.minLon, this.minLat], // Close the box
          ]],
        },
      }],
    };
    params.set('SearchParameter', JSON.stringify(obj));
    return params;
  }

  populateFromConfig(entries) {
    super.populateFromConfig(entries);
    let entry = entries.find(([k]) => k.includes('min') && k.includes('lat'));
    if (entry) [, this.minLat] = entry;
    entry = entries.find(([k]) => k.includes('max') && k.includes('lat'));
    if (entry) [, this.maxLat] = entry;
    entry = entries.find(([k]) => k.includes('min') && k.includes('lon'));
    if (entry) [, this.minLon] = entry;
    entry = entries.find(([k]) => k.includes('max') && k.includes('lon'));
    if (entry) [, this.maxLon] = entry;
  }
}
