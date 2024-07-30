import {
  a, div,
  img,
  span,
  p,
} from '../../scripts/dom-helpers.js';
import { getLoader } from '../../scripts/util.js';

export default async function decorate(block) {
  block.classList.add('cards', 'loading');
  block.appendChild(getLoader('agent-communities'));

  window.setTimeout(async () => {
    // const url = `/commonwealth-real-estate-ma312${window.location.pathname}`;
    const url = '/commonwealth-real-estate-ma312/east-greenwich/barry-alofsin/cid-473521';
    const bhhsCode = 'bhhs-ma312';

    const finalUrl = new URL('https://api.liveby.com/v1/pages');
    finalUrl.search = new URLSearchParams({
      id: bhhsCode,
      ref: url,
    });

    try {
      const response1 = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data1 = await response1.json();

      const response2 = await fetch('https://api.liveby.com/v1/neighborhood-brokerage-lookup/pages', {
        method: 'POST',
        body: JSON.stringify({
          brokerage: bhhsCode,
          child_pages: data1.child_pages,
        }),
      });

      const data2 = await response2.json();
      const modifiedData = [];

      if (data1) {
        const heroItemDiv = div({ class: 'hero-item' },
          img({ src: data1.banner_16x9 }),
          span({ class: 'hero-item-heading' }, data1.name),
          p({ class: 'hero-item-bio' }, data1.bio),
          a({ class: 'hero-item-explore', href: `/communities/${data1.name.split(' ').join('-').toLowerCase()}` }, `Explore ${data1.name}`),
        );

        block.replaceChildren(heroItemDiv);
      }

      if (data2.length) {
        modifiedData.push(...data2.map((item) => {
          const regex = /\/communities\/\w+$/;
          const match = item.url.match(regex);
          const link = match ? match[0] : '';

          return {
            name: item.name.toUpperCase(),
            exploreName: `explore ${item.name}`,
            link,
            banner: item.banner_16x9,
          };
        }));
      }

      const cardsList = div({ class: 'cards-list' });
      modifiedData.forEach((item) => {
        const card = div({ class: 'cards-item' });
        cardsList.appendChild(card);

        const cardBody = div({ class: 'cards-item-body' });
        card.appendChild(cardBody);

        cardBody.onclick = () => {
          document.location.href = item.link;
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (item.banner) {
                cardBody.style.backgroundImage = `url(${item.banner})`;
              }
              observer.unobserve(cardBody);
            }
          });
        });
        observer.observe(cardBody);

        const paragraphElement = document.createElement(('h4'));
        paragraphElement.textContent = item.exploreName;
        cardBody.appendChild(paragraphElement);
      });

      block.appendChild(cardsList);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data', error);
    }
  }, 3000);
}
