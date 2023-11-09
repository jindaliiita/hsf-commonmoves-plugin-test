import {
  preloadHeroImage,
} from '../../scripts/scripts.js';

import buildSearch from './search/search.js';

async function getPictures(block) {
  let pictures = block.querySelectorAll('picture');
  if (!pictures.length) {
    const link = block.querySelector('a');
    if (link) {
      const resp = await fetch(`${link.href}.plain.html`);
      if (resp.ok) {
        const html = await resp.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        pictures = tmp.querySelectorAll('picture');
      }
    }
  }
  pictures.forEach((picture) => {
    picture.querySelector('img').setAttribute('loading', 'eager');
  });
  return pictures;
}

function rotateImage(images) {
  const active = images.querySelector('picture.active');
  const next = active.nextElementSibling ? active.nextElementSibling : images.querySelector('picture');
  active.classList.remove('active');
  next.classList.add('active');
}

export default async function decorate(block) {
  const pictures = await getPictures(block);
  preloadHeroImage(pictures[0]);
  pictures[0].classList.add('active');
  const images = document.createElement('div');
  images.classList.add('images');
  images.append(...pictures);

  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('content');
  const content = block.querySelector('h1, h2')?.parentElement;
  if (content) {
    contentWrapper.append(...content.childNodes);
    block.classList.add('has-content');
  }

  const options = block.querySelector('ul');
  if (options) {
    const types = Object.values(options.querySelectorAll('li')).map((opt) => opt.textContent);
    const search = await buildSearch(types);
    if (search) {
      contentWrapper.append(search);
    }
  }

  const headline = block.querySelectorAll('div.hero > div > div');
  const filteredList = Array.from(headline).filter(node => {
    const innerHTML = node.innerHTML.trim().toLowerCase();
    return innerHTML === 'headline' || innerHTML === 'description' || innerHTML === 'cta';
  });
  const headlineWrapper = document.createElement('div');
  if (filteredList.length) {
    headlineWrapper.classList.add('headline');
    filteredList.forEach((div) => {
      if (div.innerHTML === 'Headline') div.nextElementSibling.classList.add('title');
      if (div.innerHTML === 'Description') div.nextElementSibling.classList.add('desc');
      if (div.innerHTML === 'CTA') {
        const button = document.createElement('p');
        button.innerHTML = div.nextElementSibling.innerHTML;
        button.classList.add('button-container');
        div.parentNode.replaceChild(button, div.nextElementSibling);
      }
      headlineWrapper.append(div.nextElementSibling);
    });
  }

  const wrapper = document.createElement('div');
  wrapper.append(images, contentWrapper);
  if (headlineWrapper.hasChildNodes()) {
    wrapper.classList.add('row');
    wrapper.append(headlineWrapper);
  }
  block.replaceChildren(wrapper);

  if (pictures.length > 1) {
    window.setInterval(() => rotateImage(images), 4000);
  }
}
