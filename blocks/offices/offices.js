import {
  createOptimizedPicture,
  toClassName,
} from '../../scripts/aem.js';
import { phoneFormat } from '../../scripts/util.js';

function buildOfficeCards(list, data) {
  data.forEach((item) => {
    const cardsItem = document.createElement('div');
    cardsItem.className = 'cards-item';
    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    const image = createOptimizedPicture(item.image, item.location, true);
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
    cardBody.append(location, address, contact);
    cardsItem.append(cardBody, contactBtn);
    list.append(cardsItem);
  });
}

function buildAgentCards(list, data) {
  const { pathname } = window.location;
  const parts = pathname.split('/');
  const pageName = parts[parts.length - 1];
  const filteredData = data.filter((item) => toClassName(item.office) === toClassName(pageName));
  filteredData.forEach((item) => {
    const cardsItem = document.createElement('div');
    cardsItem.className = 'cards-item';
    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    const tmpImage = item.image ? item.image : '/media/images/no-profile-image.png';
    const pic = document.createElement('picture');
    const image = document.createElement('img');
    pic.append(image);
    image.src = tmpImage;
    image.loading = 'eager';
    cardImage.append(pic);
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
  if (block.children[0].children.length === 2) {
    const wrapper = cards.shift();
    const title = wrapper.children[1];
    title.classList.add('title');
    wrapper.remove();
    block.prepend(title);
  }
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
}
