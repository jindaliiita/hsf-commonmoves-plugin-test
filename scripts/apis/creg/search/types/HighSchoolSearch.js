import SchoolSearch from './SchoolSearch.js';

export default class HighSchoolSearch extends SchoolSearch {
  school;

  constructor() {
    super();
    this.type = 'HighSchool';
  }
}
