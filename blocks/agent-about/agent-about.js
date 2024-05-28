import { a, div } from '../../scripts/dom-helpers.js';

const viewMoreOnClick = (anchor, block) => {
  anchor.addEventListener('click', () => {
    if (anchor.classList.contains('view-more')) {
      anchor.classList.remove('view-more');
      anchor.classList.add('view-less');
      block.querySelector('.about-text').classList.remove('hide');
      block.querySelector('.about-text-truncate').classList.add('hide');
    } else {
      anchor.classList.remove('view-less');
      anchor.classList.add('view-more');
      block.querySelector('.about-text').classList.add('hide');
      block.querySelector('.about-text-truncate').classList.remove('hide');
    }
  });
};

export default function decorate(block) {
  const children = [...block.children];
  if (children?.length) {
    children.forEach((child, index) => {
      child.classList.add(`cols-${index + 1}`);
      if (index === 0) {
        child.children[1].classList.add('about-text', 'hide');
        child.append(div({ class: 'about-text-truncate' },
          `${child.children[1].textContent.substring(0, 245)}...`));
        const anchor = a({ class: 'view-more' });
        child.append(anchor);
        viewMoreOnClick(anchor, block);
      }
    });
  }
}
