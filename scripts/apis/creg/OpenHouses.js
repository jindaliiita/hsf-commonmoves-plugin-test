export default class OpenHouses {
  constructor(value, label) {
    this.value = value;
    this.label = label;
  }
}

OpenHouses.ONLY_WEEKEND = new OpenHouses(7, 'This Weekend');
OpenHouses.ANYTIME = new OpenHouses(365, 'Anytime');
