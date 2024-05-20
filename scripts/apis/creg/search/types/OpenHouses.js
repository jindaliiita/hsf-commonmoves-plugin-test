export default class OpenHouses {
  constructor(name, value, label) {
    this.name = name;
    this.value = value;
    this.label = label;
  }

  toString() {
    return this.name;
  }

  static fromBlockConfig(configEntry) {
    if (configEntry && /weekend/i.test(configEntry)) {
      return OpenHouses.ONLY_WEEKEND;
    }
    return OpenHouses.ANYTIME;
  }

  /**
   * Finds the OpenHouse based on the value.
   *
   * @param value the value of the OpenHouse type
   * @return {undefined|OpenHouses}
   */
  static fromValue(value) {
    // eslint-disable-next-line no-param-reassign
    value = (typeof value === 'number') ? value.toFixed(0) : value;
    if (value === OpenHouses.ONLY_WEEKEND.value.toFixed(0)) {
      return OpenHouses.ONLY_WEEKEND;
    }
    if (value === OpenHouses.ANYTIME.value.toFixed(0)) {
      return OpenHouses.ANYTIME;
    }
    return undefined;
  }
}

OpenHouses.ONLY_WEEKEND = new OpenHouses('ONLY_WEEKEND', 7, 'This Weekend');
OpenHouses.ANYTIME = new OpenHouses('ANYTIME', 365, 'Anytime');
