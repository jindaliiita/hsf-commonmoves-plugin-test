export default class PropertyType {
  constructor(id, label) {
    this.ID = id;
    this.Label = label;
  }
}

PropertyType.CONDO_TOWNHOUSE = new PropertyType(1, 'Condo/Townhouse');
PropertyType.SINGLE_FAMILY = new PropertyType(2, 'Single Family');
PropertyType.COMMERCIAL = new PropertyType(3, 'Commercial');
PropertyType.MULTI_FAMILY = new PropertyType(4, 'Multi Family');
PropertyType.LAND = new PropertyType(5, 'Lot/Land');
PropertyType.FARM = new PropertyType(6, 'Farm/Ranch');
