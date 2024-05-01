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

function buildOfficeCards(list, data) {
  data.forEach((item) => {
    const cardsItem = document.createElement('div');
    cardsItem.className = 'cards-item';
    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    const image = createOptimizedPicture(item.image, item.location, true);
    image.style = 'padding-bottom: 75%';
    const type = document.createElement('p');
    type.innerText = item.type;
    cardImage.append(image, type);
    cardsItem.append(cardImage);
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const location = document.createElement('h3');
    location.innerText = item.location;
    const address = document.createElement('p');
    address.innerHTML = item.address;
    address.innerHTML += `<br/>${item.cityStateZip}`;
    address.innerHTML += `<br/>Office: ${phoneFormat(item.phone)}`;
    if (item.fax) address.innerHTML += `<br/>Office Fax: ${phoneFormat(item.fax)}`;
    const contact = document.createElement('p');
    contact.innerHTML = `<b>${item.contactName}</b>`;
    contact.innerHTML += `<br/>${item.contactTitle}`;
    contact.innerHTML += `<br/>${item.contactPhone}`;
    contact.innerHTML += `<br/>${item.contactEmail}`;
    const contactBtn = document.createElement('p');
    contactBtn.className = 'button-container';
    contactBtn.innerHTML = `<a href="/offices/${toClassName(item.location)}" title="Visit Us" class="button">Visit Us</a>`;
    cardBody.append(location, address, contact, contactBtn);
    cardsItem.append(cardBody);
    list.append(cardsItem);
  });
}

function buildAgentCards(list, data) {
  const { pathname } = window.location;
  const parts = pathname.split('/');
  const pageName = parts[parts.length - 1];
  const filteredData = data.filter((item) => item.office.toLowerCase() === pageName);
  filteredData.forEach((item) => {
    const cardsItem = document.createElement('div');
    cardsItem.className = 'cards-item';
    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    const tmpImage = 'https://main--hsf-commonmoves--hlxsites.hlx.page/media/images/no-profile-image.png';
    const image = createOptimizedPicture(tmpImage, item.name, true);
    image.style = 'padding-bottom: 75%';

    cardImage.append(image);
    cardsItem.append(cardImage);
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const nameLink = document.createElement('a');
    nameLink.className = 'name';
    nameLink.href = item.profile;
    nameLink.innerText = item.name;
    const title = document.createElement('div');
    title.className = 'title';
    title.innerText = item.title;
    const team = document.createElement('div');
    team.className = 'teamname';
    team.innerText = item.team;
    const phone = document.createElement('div');
    phone.className = 'phone';
    phone.innerText = phoneFormat(item.phone);
    const license = document.createElement('div');
    license.className = 'license';
    license.innerText = item.license;
    const contactBtn = document.createElement('p');
    contactBtn.className = 'button-container';
    contactBtn.innerHTML = `<a href="${item.profile}" title="Agent Detail" class="button">Agent Detail</a>`;
    cardBody.append(nameLink, title, team, phone, license, contactBtn);
    cardsItem.append(cardBody);
    list.append(cardsItem);
  });
}

async function fetchIndex(url) {
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
    const link = cards.shift();
    const url = new URL(link.querySelector('a[href]').href);
    const jsonData = await fetchIndex(url.href);
    link.remove();
    const list = document.createElement('div');
    list.classList.add('cards-list');
    block.append(list);
    if (url.searchParams.has('sheet')) {
      buildAgentCards(list, jsonData);
    } else {
      buildOfficeCards(list, jsonData);
    }
  } else {
    buildCards(block, cards);
  }
}
