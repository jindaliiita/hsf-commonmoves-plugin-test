export default function decorate(block) {
  // add logic for check-list case
  if (block.classList.contains('icons')) {
    block.classList.add('cards-2-cols');
    [...block.children].forEach((row) => {
      row.className = 'cards-item';
      row.children[0].classList.add('card-icon');
      row.children[1].classList.add('card-body');
    });
  } else {
    const cols = block.children;
    block.classList.add(`cards-${cols.length}-cols`);
    [...block.children].forEach((row) => {
      row.className = 'cards-item';
      [...row.children].forEach((div) => {
        if (div.querySelector('picture')) {
          // update container for picture with label
          div.classList.add('card-image');
          if (div.lastChild.nodeType === Node.TEXT_NODE) {
            const picture = div.querySelector('picture');
            const paragraphElement = document.createElement(('p'));
            paragraphElement.append(div.lastChild);
            div.append(picture, paragraphElement);
          }
        } else div.classList.add('card-body');
      });
    });
  }
}
