import ListingType from './types/ListingType.js';
import PropertyType from './types/PropertyType.js';
import OpenHouses from './types/OpenHouses.js';

export const UPDATE_SEARCH_EVENT = 'UpdateSearch';

export const STORAGE_KEY = 'CommonMovesSearchParams';
export const SEARCH_URL = '/search';

export default class Search {
  input;

  type = 'Empty';

  minPrice;

  maxPrice;

  minBedrooms;

  minBathrooms;

  minSqft;

  maxSqft;

  keywords = [];

  matchAnyKeyword = false;

  minYear;

  maxYear;

  isNew = false;

  priceChange = false;

  luxury = false;

  bhhsOnly = false;

  page = '1';

  pageSize = '36';

  franchiseeCode;

  // Private
  #openHouses;

  #listingTypes = [ListingType.FOR_SALE];

  #propertyTypes = [PropertyType.CONDO_TOWNHOUSE, PropertyType.SINGLE_FAMILY];

  #sortBy = 'PRICE';

  #sortDirection = 'DESC';

  constructor() {
    Object.defineProperties(this, {
      openHouses: {
        enumerable: true,
        set: (value) => {
          if (typeof value === 'object' && OpenHouses[value.name]) {
            this.#openHouses = OpenHouses[value.name];
          } else {
            this.#openHouses = OpenHouses[value] ? OpenHouses[value] : undefined;
          }
        },
        get: () => this.#openHouses,
      },

      listingTypes: {
        enumerable: true,
        set: (types) => {
          this.#listingTypes = [];
          // eslint-disable-next-line no-param-reassign
          types = !Array.isArray(types) ? [types] : types;
          types.forEach((type) => {
            this.addListingType(type);
          });
        },
        get: () => [...this.#listingTypes],
      },

      propertyTypes: {
        enumerable: true,
        set: (types) => {
          this.#propertyTypes = [];
          // eslint-disable-next-line no-param-reassign
          types = !Array.isArray(types) ? [types] : types;
          types.forEach((type) => {
            this.addPropertyType(type);
          });
        },
        get: () => [...this.#propertyTypes],
      },

      sortBy: {
        enumerable: true,
        set: (value) => {
          if (['DATE', 'PRICE', 'DISTANCE'].includes(value.toUpperCase())) {
            this.#sortBy = value.toUpperCase();
          }
        },
        get: () => this.#sortBy,
      },

      sortDirection: {
        enumerable: true,
        set: (value) => {
          ['ASC', 'DESC'].forEach((d) => {
            if (value.toUpperCase().indexOf(d) > -1) {
              this.#sortDirection = d;
            }
          });
        },
        get: () => this.#sortDirection,
      },
    });
  }

  /**
   * Adds a property type to the current list.
   *
   * @param {ListingType|String} type
   */
  addListingType(type) {
    let t;
    if (typeof type === 'object' && ListingType[type.type]) {
      t = ListingType[type.type];
    } else if (typeof type === 'string' && ListingType[type]) {
      t = ListingType[type];
    }
    if (t && !this.#listingTypes.includes(t)) this.#listingTypes.push(t);
  }

  removeListingType(type) {
    let t;
    if (typeof type === 'object' && ListingType[type.type]) {
      t = ListingType[type.type];
    } else if (typeof type === 'string' && ListingType[type]) {
      t = ListingType[type];
    }
    if (t && this.#listingTypes.includes(t)) {
      const idx = this.#listingTypes.indexOf(t);
      this.#listingTypes.splice(idx, 1);
    }
  }

  /**
   * Adds a property type to the current list.
   *
   * @param {PropertyType|String} type
   */
  addPropertyType(type) {
    let t;
    if (typeof type === 'object') {
      if (type.name) {
        t = PropertyType[type.name];
      } else if (type.id) {
        t = PropertyType.fromId(type.id);
      }
    } else if (typeof type === 'string') {
      t = PropertyType[type];
    } else if (typeof type === 'number') {
      t = PropertyType.fromId(type);
    }
    if (t && !this.#propertyTypes.includes(t)) this.#propertyTypes.push(t);
  }

  /**
   * Removes a property type to the current list.
   *
   * @param {PropertyType|String} type
   */
  removePropertyType(type) {
    let t;
    if (typeof type === 'object') {
      if (type.name) {
        t = PropertyType[type.name];
      } else if (type.id) {
        t = PropertyType.fromId(type.id);
      }
    } else if (typeof type === 'string') {
      t = PropertyType[type];
    } else if (typeof type === 'number') {
      t = PropertyType.fromId(type);
    }
    if (t && this.#propertyTypes.includes(t)) {
      const idx = this.#propertyTypes.indexOf(t);
      this.#propertyTypes.splice(idx, 1);
    }
  }

  /**
   * Converts this Search instance into URL Search Parameters for the CREG API.
   * @return {URLSearchParams}
   */
  asCregURLSearchParameters() {
    const params = new URLSearchParams();
    params.set('SearchType', this.type);

    if (this.input) params.set('SearchInput', this.input);
    if (this.minPrice) params.set('MinPrice', this.minPrice);
    if (this.maxPrice) params.set('MaxPrice', this.maxPrice);
    if (this.minBedrooms) params.set('MinBedroomsTotal', this.minBedrooms);
    if (this.minBathrooms) params.set('MinBathroomsTotal', this.minBathrooms);
    if (this.minSqft) params.set('MinLivingArea', this.minSqft);
    if (this.maxSqft) params.set('MaxLivingArea', this.maxSqft);
    if (this.keywords && this.keywords.length > 0) params.set('Features', this.keywords.join(','));
    if (this.matchAnyKeyword) params.set('MatchAnyFeatures', 'true');
    if (this.minYear || this.maxYear) {
      params.set('YearBuilt', `${this.minYear || 1800}-${this.maxYear || 2100}`);
    }
    if (this.isNew) params.set('NewListing', 'true');
    if (this.priceChange) params.set('RecentPriceChange', 'true');
    if (this.luxury) params.set('Luxury', 'true');
    if (this.bhhsOnly) params.set('FeaturedCompany', 'BHHS');
    if (this.openHouses) params.set('OpenHouses', this.openHouses.value);

    params.set('Page', this.page);
    params.set('PageSize', this.pageSize);

    params.set('ApplicationType', this.listingTypes.map((t) => t.type).join(','));
    params.set('PropertyType', this.propertyTypes.map((t) => t.id).join(','));

    if (this.franchiseeCode) {
      params.set('isFranchisePage', 'true');
      params.set('franchiseeCode', this.franchiseeCode.toUpperCase());
    }

    params.set('Sort', `${this.sortBy}_${this.sortDirection}ENDING`);
    return params;
  }

  /**
   * Returns a URLSearchParameter representing this object.
   * @return {URLSearchParams}
   */
  asURLSearchParameters() {
    const params = [];
    Object.entries(this).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params.push([key, v]);
          });
        } else {
          params.push([key, value]);
        }
      }
    });
    return new URLSearchParams(params);
  }

  populateFromURLSearchParameters(params) {
    [...params.entries()].forEach(([k, v]) => {
      if (k === 'type') {
        return;
      }
      // Fill object.
      if (Object.hasOwn(this, k)) {
        this[k] = v;
      }
    });
    this.listingTypes = params.getAll('listingTypes');
    this.propertyTypes = params.getAll('propertyTypes');
    this.keywords = params.getAll('keywords');
    // Coerce boolean
    if (typeof this.isNew === 'string') {
      this.isNew = Boolean(this.isNew).valueOf();
    }
    if (typeof this.matchAnyKeyword === 'string') {
      this.matchAnyKeyword = Boolean(this.matchAnyKeyword).valueOf();
    }
    if (typeof this.priceChange === 'string') {
      this.priceChange = Boolean(this.priceChange).valueOf();
    }
    if (typeof this.luxury === 'string') {
      this.luxury = Boolean(this.luxury).valueOf();
    }
    if (typeof this.bhhsOnly === 'string') {
      this.bhhsOnly = Boolean(this.bhhsOnly).valueOf();
    }
  }

  populateFromConfig(entries) {
    let entry = entries.find(([k]) => k.match(/min.*price/i));
    if (entry) [, this.minPrice] = entry;
    entry = entries.find(([k]) => k.match(/max.*price/i));

    if (entry) [, this.maxPrice] = entry;
    this.isNew = !!entries.find(([k]) => k.match(/new/i));

    entry = entries.find(([k]) => k.match(/open.*house/i));
    if (entry) this.openHouses = OpenHouses.fromBlockConfig(entry);

    entry = entries.find(([k]) => k.match(/page.*size/i));
    if (entry) [, this.pageSize] = entry;

    this.listingTypes = ListingType.fromBlockConfig(entries.find(([k]) => k.match(/(listing|application).*type/i)));
    this.propertyTypes = PropertyType.fromBlockConfig(entries.find(([k]) => k.match(/property.*type/i)));

    entry = entries.find(([k]) => k.match(/sort.*by/i));
    if (entry) this.sortBy = entry[1].toUpperCase();

    entry = entries.find(([k]) => k.match(/sort.*direction/i));
    if (entry) this.sortDirection = entry[1].toUpperCase();
  }

  /**
   * Populates from the Suggestion URL Parameters
   * @param {URLSearchParams} params
   */
  populateFromSuggestion(params) {
    this.input = params.get('SearchInput');
  }

  /**
   * Loads the specified search type.
   *
   * @param {string} type
   * @return {Promise<Search>}
   */
  static async load(type) {
    let search = new Search();
    if (type && type !== 'Empty') {
      try {
        const mod = await import(`./types/${type}Search.js`);
        if (mod.default) {
          // eslint-disable-next-line new-cap
          search = new mod.default();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`failed to load Search Type for ${type}`, error);
      }
    }
    return search;
  }

  /**
   * Builds a new Search instance from a URL query string
   * @param {String} query the query string
   * @return {Promise<Search>} the search instance
   */
  static async fromQueryString(query) {
    const params = new URLSearchParams(query);
    let search = new Search();
    if (params.has('type') && params.get('type') !== 'Empty') {
      const type = params.get('type').replace(/(^\w)|\s+(\w)/g, (letter) => letter.toUpperCase());
      search = await Search.load(type);
    }
    search.populateFromURLSearchParameters(params);
    return search;
  }

  /**
   * Builds a new Search instance from a Block Config.
   * @param {Object} config the block config
   * @return {Promise<Search>} the search instance
   */
  static async fromBlockConfig(config) {
    const entries = Object.entries(config);
    let search = new Search();
    const typeInput = entries.find(([k]) => k.match(/search.*type/i));
    if (typeInput) {
      const type = typeInput[1].replace(/(^\w)|\s+(\w)/g, (letter) => letter.toUpperCase()).replaceAll(/\s/g, '');
      search = await Search.load(type);
    }
    search.populateFromConfig(entries);
    return search;
  }

  /**
   * Creates Search instance from a JSON Object.
   * @param {Object} json
   * @return {Promise<Search>} the search instance
   */
  static async fromJSON(json) {
    let search = new Search();
    const { type } = json;
    if (type && type !== 'Empty') {
      search = await Search.load(type);
    }
    Object.assign(search, json);
    return search;
  }
}
