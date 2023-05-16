import SearchType from '../../scripts/apis/creg/SearchType.js';
import Search from './search.js';

/**
 * Create and render property search based on a bounding box.
 */
export default class MapSearch extends Search {
  more = false;

  #minLat;

  #minLon;

  #maxLat;

  #maxLon;

  constructor(minLat, minLon, maxLat, maxLon) {
    super(SearchType.Map, SearchType.Map.paramBuilder(minLat, maxLat, minLon, maxLon));
    this.#minLat = minLat;
    this.#minLon = minLon;
    this.#maxLat = maxLat;
    this.#maxLon = maxLon;
  }
}
