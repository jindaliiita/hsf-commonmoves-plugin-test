import { LIVEBY_API } from '../../scripts/scripts.js';

const ES_GRADES = ['PK', 'KG', '01', '02', '03', '04', '05', '06'];
const MS_GRADES = ['07', '08'];
const HS_GRADES = ['09', '10', '11', '12'];

const nameSort = ((l, r) => {
  if (l.name < r.name) {
    return -1;
  }
  if (l.name > r.name) {
    return 1;
  }
  return 0;
});

const ratingSort = ((l, r) => r.rating - l.rating);

const privateSort = ((l, r) => {
  if (l.type === 'Private' && r.type !== 'Private') {
    return -1;
  }
  if (l.type !== 'Private' && r.type === 'Private') {
    return 1;
  }
  if (l.type === 'Private' && r.type === 'Private') {
    return 0;
  }
  return 0;
});

const publicSort = ((l, r) => {
  if (l.type === 'Public' && r.type !== 'Public') {
    return -1;
  }
  if (l.type !== 'Public' && r.type === 'Public') {
    return 1;
  }
  if (l.type === 'Public' && r.type === 'Public') {
    return 0;
  }
  return 0;
});

const sortMap = {
  name: nameSort,
  public: publicSort,
  private: privateSort,
  rating: ratingSort,
};

async function buildSchoolList(type, schools, sort = ratingSort) {
  const star = await fetch('/icons/liveby_rating.svg').then((resp) => (resp.ok ? resp.text() : ''));
  const sorted = schools.sort(sort);

  const section = document.createElement('section');
  const header = document.createElement('h3');
  header.textContent = `${type} Schools`;
  section.append(header);

  sorted.forEach((s) => {
    let title = s.name;
    if (s.overviewLink) {
      title = `<a href="${s.overviewLink}" target="_blank">${s.name}</a>`;
    }

    const item = document.createElement('div');
    item.classList.add('school-item');
    item.innerHTML = `
      <div class="school-details">
        <span class="type">${s.type}</span>
        <h3 class="school-name">${title}</h3>
        <ul>
          <li><span class="info-label">Grades</span><span class="info-value">${s.gradeRange}</span></li>
          <li><span class="info-label">Enrollment</span><span class="info-value">${s.enrollment}</span></li>
        </ul>
      </div>
    `;

    const rating = document.createElement('div');
    rating.classList.add('school-rating');
    if (s.rating) {
      for (let i = 1; i <= 5; i += 1) {
        const span = document.createElement('span');
        span.classList.add('icon', 'icon-liveby_rating');
        if (s.rating >= i) {
          span.classList.add('filled');
        }
        span.innerHTML = star;
        rating.append(span);
      }
    } else {
      rating.classList.add('unavailable');
      rating.textContent = 'Rating Unavailable';
    }
    item.append(rating);
    section.append(item);
  });
  return section;
}

function filterSchools(schools) {
  const elementary = [];
  const middle = [];
  const high = [];
  schools.forEach((s) => {
    const match = s.gradeRange.match(/(\w+).*?(\w+)/);
    if (match) {
      if (ES_GRADES.includes(match[1]) || ES_GRADES.includes(match[2])) {
        elementary.push(s);
      }
      if (MS_GRADES.includes(match[1]) || MS_GRADES.includes(match[2])) {
        middle.push(s);
      }
      if (HS_GRADES.includes(match[1]) || HS_GRADES.includes(match[2])) {
        high.push(s);
      }
    }
  });
  return { elementary, middle, high };
}

export default async function decorate(block) {
  if (window.liveby && window.liveby.communityId) {
    // Fetch the school data.
    const types = encodeURIComponent('public,private,catholic');
    const resp = await fetch(`${LIVEBY_API}/schools/info?boundary=${window.liveby.communityId}&format=expanded&types=${types}&limit=500&offset=0`);

    if (resp.ok) {
      const { schools } = await resp.json();
      const {
        elementary,
        middle,
        high,
      } = filterSchools(schools);
      const sort = document.createElement('div');
      sort.classList.add('sort');
      sort.innerHTML = `
        <label role="presentation">Sort by
          <select>
            <option value="name">Name</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option selected value="rating">Rating</option>
            </select>
        </label>
      `;
      block.replaceChildren(sort);

      const sections = document.createElement('div');
      sections.classList.add('school-lists');

      sections.append(
        await buildSchoolList('Elementary', elementary),
        await buildSchoolList('Middle', middle),
        await buildSchoolList('High', high),
      );
      block.append(sections);

      const more = document.createElement('div');
      more.classList.add('actions');
      more.innerHTML = `
        <p class="button-container">
          <a href="#">Load More</a>
        </p>
      `;
      more.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        more.previousSibling.classList.add('show-all');
        more.remove();
      });
      block.append(more);

      block.querySelector('.sort select').addEventListener('change', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const resort = sortMap[e.target.value || 'name'];
        sections.replaceChildren(
          await buildSchoolList('Elementary', elementary, resort),
          await buildSchoolList('Middle', middle, resort),
          await buildSchoolList('High', high, resort),
        );
      });
    }
  }
}
