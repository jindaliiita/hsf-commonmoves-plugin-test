import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();
    // decorate footer DOM
    const footer = document.createElement('div');
    footer.className = 'footer-container-flex';
    footer.innerHTML = html;
    decorateIcons(footer);
    block.append(footer);
    const parentDiv = block.querySelector('ul').closest('div');
    const ulChildren = [...parentDiv.querySelectorAll('ul')];
    const wrapper = document.createElement('div');
    wrapper.className = 'link-menu-row';
    ulChildren.forEach((elem) => {
      const div = document.createElement('div');
      div.className = 'link-menu-col';
      div.classList.add('column-12');
      div.classList.add('column-lg-6');
      div.append(elem);
      wrapper.append(div);
    });
    parentDiv.prepend(wrapper);
    const footerContainerFlexDivs = [...document.querySelector('.footer-container-flex').children];
    footerContainerFlexDivs.slice(0, -1).forEach((elem) => elem.classList.add('column-12'));
    footerContainerFlexDivs[0].classList.add('column-md-3');
    footerContainerFlexDivs[1].classList.add('column-md-4');
    footerContainerFlexDivs[1].classList.add('column-lg-6');
    footerContainerFlexDivs[2].classList.add('column-md-5');
    footerContainerFlexDivs[2].classList.add('column-lg-3');
  }
}
