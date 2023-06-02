export default class ApplicationType {
  constructor(type, label) {
    this.type = type;
    this.label = label;
  }
}

ApplicationType.FOR_SALE = new ApplicationType('FOR_SALE', 'For Sale');
ApplicationType.FOR_RENT = new ApplicationType('FOR_RENT', 'For Rent');
ApplicationType.PENDING = new ApplicationType('PENDING', 'Pending');
ApplicationType.RECENTLY_SOLD = new ApplicationType('RECENTLY_SOLD', 'Recently Sold');

/**
* Returns the ApplicationType for the specified string.
*
* @param {string} type
* @returns {ApplicationType} the matching type.
*/
export function applicationTypeFor(type) {
  const [found] = Object.getOwnPropertyNames(ApplicationType)
    .filter((t) => t.toLowerCase() === type.toLowerCase())
    .map((t) => ApplicationType[t]);

  return found;
}
