export default function decorate(block) {
  const cards = [...block.children];

  // Check for a title row
  if (!block.classList.contains('shade-icon') && block.children[0].children.length === 1) {
    const wrapper = cards.shift();
    const title = wrapper.children[0];
    title.classList.add('title');
    wrapper.remove();
    block.prepend(title);
  }

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
