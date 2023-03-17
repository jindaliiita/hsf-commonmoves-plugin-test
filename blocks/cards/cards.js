export default function decorate(block) {
  // add logic for check-list case
  if (block.classList.contains('cards-checklist')) {
    block.classList.add('cards-2-cols');
    [...block.children].forEach((row) => {
      row.className = 'cards-item';
      [...row.children].forEach((div) => {
        div.className = 'cards-card-body';
      });
      const checkbox = document.createElement('div');
      checkbox.className = 'checkmark';
      const description = row.querySelector('.cards-card-body');
      row.append(checkbox, description);
    });
  } else {
    const cols = block.children;
    block.classList.add(`cards-${cols.length}-cols`);
    [...block.children].forEach((row) => {
      row.className = 'cards-item';
      [...row.children].forEach((div) => {
        if (div.querySelector('picture')) {
          // update container for picture with label
          div.className = 'cards-card-image';
          if (div.lastChild.nodeType === Node.TEXT_NODE) {
            const picture = div.querySelector('picture');
            const paragraphElement = document.createElement(('p'));
            paragraphElement.append(div.lastChild);
            div.append(picture, paragraphElement);
          }
        } else div.className = 'cards-card-body';
      });
    });
  }
}
