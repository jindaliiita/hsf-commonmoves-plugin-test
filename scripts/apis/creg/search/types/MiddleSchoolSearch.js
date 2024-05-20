import SchoolSearch from './SchoolSearch.js';

export default class MiddleSchoolSearch extends SchoolSearch {
  school;

  constructor() {
    super();
    this.type = 'MiddleSchool';
  }
}
