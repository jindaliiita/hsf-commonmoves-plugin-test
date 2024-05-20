export default class PropertyType {
  constructor(name, value, label) {
    this.name = name;
    this.id = value;
    this.label = label;
  }

  toString() {
    return this.name;
  }

  /**
   * Finds the Property type based on the provided id.
   * @param {integer} id the id
   * @return {PropertyType} the type for the id
   */
  static fromId(id) {
    // eslint-disable-next-line no-use-before-define
    if (id < 0 || id > ALL.length - 1) {
      return undefined;
    }
    // eslint-disable-next-line no-use-before-define
    return ALL[id];
  }

  static fromBlockConfig(configEntry) {
    const types = [];
    if (!configEntry) {
      types.push(PropertyType.CONDO_TOWNHOUSE);
      types.push(PropertyType.SINGLE_FAMILY);
      return types;
    }

    const [, configStr] = configEntry;
    if (configStr.match(/(condo|townhouse)/i)) {
      types.push(PropertyType.CONDO_TOWNHOUSE);
    }
    if (configStr.match(/single\s+family/gi)) {
      types.push(PropertyType.SINGLE_FAMILY);
    }
    if (configStr.match(/commercial/gi)) {
      types.push(PropertyType.COMMERCIAL);
    }
    if (configStr.match(/multi\s+family/gi)) {
      types.push(PropertyType.MULTI_FAMILY);
    }
    if (configStr.match(/(lot|land)/gi)) {
      types.push(PropertyType.LAND);
    }
    if (configStr.match(/(farm|ranch)/gi)) {
      types.push(PropertyType.FARM);
    }
    return types;
  }
}

PropertyType.CONDO_TOWNHOUSE = new PropertyType('CONDO_TOWNHOUSE', 1, 'Condo/Townhouse');
PropertyType.SINGLE_FAMILY = new PropertyType('SINGLE_FAMILY', 2, 'Single Family');
PropertyType.COMMERCIAL = new PropertyType('COMMERCIAL', 3, 'Commercial');
PropertyType.MULTI_FAMILY = new PropertyType('MULTI_FAMILY', 4, 'Multi Family');
PropertyType.LAND = new PropertyType('LAND', 5, 'Lot/Land');
PropertyType.FARM = new PropertyType('FARM', 6, 'Farm/Ranch');

const ALL = [
  undefined, // Empty space
  PropertyType.CONDO_TOWNHOUSE,
  PropertyType.SINGLE_FAMILY,
  PropertyType.COMMERCIAL,
  PropertyType.MULTI_FAMILY,
  PropertyType.LAND,
  PropertyType.FARM,
];
