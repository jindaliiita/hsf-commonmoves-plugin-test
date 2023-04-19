import {
  preloadHeroImage,
} from '../../scripts/scripts.js';

import homes from './home-search.js';
import agents from './agent-search.js';

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

async function buildSearch(ul) {
  if (!ul) {
    return undefined;
  }
  const wrapper = document.createElement('div');
  wrapper.classList.add('search');
  const tabs = document.createElement('ul');
  tabs.classList.add('options');
  wrapper.append(tabs);

  const items = ul.querySelectorAll('li');
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    item.classList.add('option');
    let form;
    if (item.textContent.toLowerCase() === 'homes') {
      // eslint-disable-next-line no-await-in-loop
      form = await homes.buildForm();
    } else if (item.textContent.toLowerCase() === 'agents') {
      form = agents.buildForm();
    }

    if (form) {
      const option = item.textContent.toLowerCase();
      item.setAttribute('data-option', option);
      tabs.append(item);
      form.setAttribute('data-option', option);
      wrapper.append(form);
    }
  }
  const active = wrapper.querySelector('.search .options .option');
  active.classList.add('active');
  wrapper.querySelector(`form[data-option="${active.getAttribute('data-option')}"]`).classList.add('active');

  wrapper.querySelectorAll('.search .options .option').forEach((option) => {
    option.addEventListener('click', () => {
      if (option.classList.contains('active')) {
        return;
      }
      const selected = option.getAttribute('data-option');
      option.parentElement.querySelector('.active').classList.remove('active');
      option.classList.add('active');
      wrapper.querySelector('form.active').classList.remove('active');
      wrapper.querySelector(`form.${selected}`).classList.add('active');
    });
  });

  return wrapper;
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

  const search = await buildSearch(block.querySelector('ul'));
  if (search) {
    contentWrapper.append(search);
  }

  const wrapper = document.createElement('div');
  wrapper.append(images, contentWrapper);
  block.replaceChildren(wrapper);

  if (pictures.length > 1) {
    window.setInterval(() => rotateImage(images), 4000);
  }
}
