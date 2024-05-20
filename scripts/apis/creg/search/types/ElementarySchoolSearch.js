import SchoolSearch from './SchoolSearch.js';

export default class ElementarySchoolSearch extends SchoolSearch {
  school;

  constructor() {
    super();
    this.type = 'ElementarySchool';
  }
}
