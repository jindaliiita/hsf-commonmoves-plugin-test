export default class ListingType {
  constructor(type, label) {
    this.type = type;
    this.label = label;
  }

  toString() {
    return this.type;
  }

  static fromBlockConfig(configEntry) {
    const types = [];
    if (!configEntry) {
      types.push(ListingType.FOR_SALE);
      return types;
    }

    const [, configStr] = configEntry;
    if (configStr.match(/sale/i)) {
      types.push(ListingType.FOR_SALE);
    }
    if (configStr.match(/rent/gi)) {
      types.push(ListingType.FOR_RENT);
    }
    if (configStr.match(/pending/gi)) {
      types.push(ListingType.PENDING);
    }
    if (configStr.match(/sold/gi)) {
      types.push(ListingType.RECENTLY_SOLD);
    }
    return types;
  }
}

ListingType.FOR_SALE = new ListingType('FOR_SALE', 'For Sale');
ListingType.FOR_RENT = new ListingType('FOR_RENT', 'For Rent');
ListingType.PENDING = new ListingType('PENDING', 'Pending');
ListingType.RECENTLY_SOLD = new ListingType('RECENTLY_SOLD', 'Recently Sold');
