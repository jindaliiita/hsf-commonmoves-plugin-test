import SearchType from '../../scripts/apis/creg/SearchType.js';
import Search from './search.js';

/**
 * Create and render property search based on a point and radius.
 */
export default class RadiusSearch extends Search {
  more = false;

  #lat;

  #lon;

  #radius;

  constructor(lat, lon, radius) {
    super(SearchType.Radius, SearchType.Radius.paramBuilder(lat, lon, radius));
    this.#lat = lat;
    this.#lon = lon;
    this.#radius = radius;
  }
}
