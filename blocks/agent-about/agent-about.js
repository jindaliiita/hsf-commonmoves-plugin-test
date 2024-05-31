import {
  a, div, ul, li,
} from '../../scripts/dom-helpers.js';

const viewMoreOnClick = (name, anchor, block) => {
  anchor.addEventListener('click', () => {
    if (anchor.classList.contains('view-more')) {
      anchor.classList.remove('view-more');
      anchor.classList.add('view-less');
      block.querySelector(`.${name}`).classList.remove('hide');
      block.querySelector(`.${name}-truncate`).classList.add('hide');
    } else {
      anchor.classList.remove('view-less');
      anchor.classList.add('view-more');
      block.querySelector(`.${name}`).classList.add('hide');
      block.querySelector(`.${name}-truncate`).classList.remove('hide');
    }
  });
};

export default function decorate(block) {
  const children = [...block.children];
  if (children?.length) {
    children.forEach((child, index) => {
      child.classList.add(`cols-${index + 1}`);
      if (index === 0) {
        const name = 'about-text';
        const threshold = 245;
        child.children[1].classList.add(name);
        if (child.children[1].textContent > threshold) {
          child.children[1].classList.add('hide');
          child.append(div({ class: `${name}-truncate` },
            `${child.children[1].textContent.substring(0, threshold)}...`));
          const anchor = a({ class: 'view-more' });
          child.append(anchor);
          viewMoreOnClick(name, anchor, block);
        }
      } else {
        const threshold = 3;
        const name = child.children[0].textContent.toLowerCase().replace(/\s/g, '-');
        const liItems = child.children[1].querySelectorAll('li');
        child.children[1].classList.add(name);

        if (liItems.length > threshold) {
          child.children[1].classList.add('hide');
          const tempUl = ul({ });
          Array.from(child.children[1].querySelectorAll('li'))
            .slice(0, threshold).forEach((liItem) => {
              const tempLi = li({}, liItem.textContent);
              tempUl.append(tempLi);
            });

          child.append(div({ class: `${name}-truncate` }, tempUl));
          const anchor = a({ class: 'view-more' });
          child.append(anchor);
          viewMoreOnClick(name, anchor, block);
        }
      }
    });
  }
}
