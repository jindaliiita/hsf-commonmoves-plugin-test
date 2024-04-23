import {
  createOptimizedPicture,
  toClassName,
} from '../../scripts/aem.js';
import { phoneFormat } from '../../scripts/util.js';

function buildCards(block, cards) {
  const list = document.createElement('div');
  list.classList.add('cards-list');
  block.append(list);

  // add logic for checklist case
  if (block.classList.contains('icons')) {
    block.classList.add('cards-2-cols');
    cards.forEach((row) => {
      row.className = 'cards-item';
      row.children[0].classList.add('card-icon');
      row.children[1].classList.add('card-body');
      list.append(row);
    });
  } else {
    let ratio = 9999;
    block.classList.add(`cards-${cards.length}-cols`);
    cards.forEach((row) => {
      row.className = 'cards-item';
      [...row.children].forEach((div) => {
        if (div.querySelector('picture')) {
          // update container for picture with label
          div.classList.add('card-image');
          const picture = div.querySelector('picture');
          const img = picture.querySelector('img');
          const tmp = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
          if (tmp < ratio) {
            ratio = tmp;
          }
          const paragraphElement = document.createElement(('p'));
          paragraphElement.textContent = div.textContent.trim();
          div.replaceChildren(picture, paragraphElement);
        } else {
          div.classList.add('card-body');
        }
      });
      // Pad the picture with the smallest ratio image.
      [...row.children].forEach((div) => {
        if (div.querySelector('picture')) {
          div.querySelector('picture').style.paddingBottom = `${ratio}%`;
        }
      });
      list.append(row);
    });
  }
}

async function fetchOffices(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
}

export default async function decorate(block) {
  const cards = [...block.children];

  // Check for a title row
  if (!block.classList.contains('shade-icon') && block.children[0].children.length === 1) {
    const wrapper = cards.shift();
    const title = wrapper.children[0];
    title.classList.add('title');
    wrapper.remove();
    block.prepend(title);
  }
  // Check for JSON data
  if (cards.length === 1 && cards[0].children.length === 1) {
    const url = cards.shift();
    const offices = await fetchOffices(url.querySelector('a[href]').href);
    url.remove();
    const list = document.createElement('div');
    list.classList.add('cards-list');
    block.append(list);
    offices.forEach((office) => {
      const cardsItem = document.createElement('div');
      cardsItem.className = 'cards-item';
      const cardImage = document.createElement('div');
      cardImage.className = 'card-image';
      const image = createOptimizedPicture(office.image, office.location, true);
      image.style = 'padding-bottom: 75%';
      const type = document.createElement('p');
      type.innerText = office.type;
      cardImage.append(image, type);
      cardsItem.append(cardImage);

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      const location = document.createElement('h3');
      location.innerText = office.location;
      const address = document.createElement('p');
      address.innerHTML = office.address;
      address.innerHTML += `<br/>${office.cityStateZip}`;
      address.innerHTML += `<br/>Office: ${phoneFormat(office.phone)}`;
      if (office.fax) address.innerHTML += `<br/>Office Fax: ${phoneFormat(office.fax)}`;
      const contact = document.createElement('p');
      contact.innerHTML = `<b>${office.contactName}</b>`;
      contact.innerHTML += `<br/>${office.contactTitle}`;
      contact.innerHTML += `<br/>${office.contactPhone}`;
      contact.innerHTML += `<br/>${office.contactEmail}`;
      const contactBtn = document.createElement('p');
      contactBtn.className = 'button-container';
      contactBtn.innerHTML = `<a href="/offices/${toClassName(office.location)}" title="Visit Us" class="button">Visit Us</a>`;
      cardBody.append(location, address, contact, contactBtn);
      cardsItem.append(cardBody);
      list.append(cardsItem);
    });
  } else {
    buildCards(block, cards);
  }
}
