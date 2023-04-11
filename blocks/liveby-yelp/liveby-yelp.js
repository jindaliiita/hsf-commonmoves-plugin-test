import { LIVEBY_API } from '../../scripts/scripts.js';

async function getAmenities(category) {
  const resp = await fetch(`${LIVEBY_API}/yelp-businesses`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language: 'en',
      offset: 0,
      limit: 12,
      categories: [category],
      lat: window.liveby.geometry.coordinates[0][0][1],
      lon: window.liveby.geometry.coordinates[0][0][0],
      geometry: window.liveby.geometry,
    }),
  });

  if (resp.ok) {
    const data = await resp.json();
    return data[category].business;
  }
  return undefined;
}

const buildItem = (business) => {
  const li = document.createElement('li');
  li.classList.add('amenity-item');
  li.style.backgroundImage = `linear-gradient(transparent 50%, rgb(0 0 0)), url("${business.image_url}")`;
  li.innerHTML = `
      <a href="${business.url}" target="_blank">
        <span class="name">${business.name}</span>
        <span class="rating" data-rating="${business.rating}">${business.rating}</span>
        <span class="reviews">${business.review_count} Yelp ${business.review_count === 1 ? 'review' : 'reviews'}</span>
      </a>
  `;
  return li;
};

async function checkAndFillContent(ul) {
  const category = ul.getAttribute('data-category');
  const items = ul.querySelectorAll('li');
  if (!items.length) {
    const businesses = await getAmenities(category);
    ul.append(...businesses.map(buildItem));
  }
}

export default async function decorate(block) {
  if (window.liveby && window.liveby.communityId && window.liveby.geometry) {
    const amenities = [];

    block.children[0].children[1].querySelectorAll('li').forEach((li) => amenities.push(li.textContent));
    block.innerHTML = amenities;

    const categories = document.createElement('div');
    categories.classList.add('categories');

    const yelp = document.createElement('div');
    yelp.classList.add('yelp-trademark');
    yelp.innerHTML = '<img src="/icons/yelp/logo.png" alt="yelp trademark" height="46" width="71" />';

    const amenitiesWrapper = document.createElement('div');
    amenitiesWrapper.classList.add('amenities');
    amenitiesWrapper.innerHTML = '<div class="spinner"><span></span></div>';

    amenities.forEach((category) => {
      const container = document.createElement('div');
      container.classList.add('button-container');
      container.innerHTML = `<a href="#" class="category" data-category="${category.toLowerCase()}">${category}</a>`;
      categories.append(container);

      const ul = document.createElement('ul');
      ul.setAttribute('data-category', category.toLowerCase());
      ul.classList.add(`amenities-${category.toLowerCase()}`);
      amenitiesWrapper.append(ul);
    });

    const active = categories.querySelector('a').getAttribute('data-category');
    categories.querySelector('a').classList.add('active');
    amenitiesWrapper.querySelector(`ul[data-category="${active}"]`).classList.add('active');

    categories.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        amenitiesWrapper.classList.add('loading');
        categories.querySelector('a.active').classList.remove('active');
        e.currentTarget.classList.add('active');
        const ul = block.querySelector(`ul[data-category="${e.currentTarget.getAttribute('data-category')}"]`);
        await checkAndFillContent(ul);
        block.querySelector('ul.active').classList.remove('active');
        ul.classList.add('active');
        amenitiesWrapper.classList.remove('loading');
      });
    });

    const more = document.createElement('div');
    more.classList.add('load-more');
    more.innerHTML = `
      <p class="button-container">
        <a href="#">Load More</a>
      </p>
    `;
    more.querySelector('a').addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const wrapper = e.currentTarget.closest('.liveby-yelp.block');
      wrapper.setAttribute('data-page', parseInt(wrapper.getAttribute('data-page'), 10) + 1);
    });

    block.replaceChildren(categories, yelp, amenitiesWrapper, more);
    block.setAttribute('data-page', 1);

    // TODO: Possibly make this party of Party Town loading?
    await checkAndFillContent(block.querySelector('ul.active'));
  } else {
    block.remove();
  }
}
