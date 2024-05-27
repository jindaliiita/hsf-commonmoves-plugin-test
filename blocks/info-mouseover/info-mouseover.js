import { decorateIcons } from '../../scripts/aem.js';
import { BREAKPOINTS } from '../../scripts/scripts.js';

function positionIcon(heading, icon) {
  const size = window.getComputedStyle(heading, null).getPropertyValue('font-size');
  icon.style.paddingBottom = `${parseFloat(size) - 13}px`;
}

/**
 * Binds content under an info image, to the nearest previous title sibling.
 * @param block
 * @returns {Promise<void>}
 */

export default async function decorate(block) {
  const heading = block.closest('.section').querySelector('h1,h2,h3,h4,h5,h6');

  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-info-circle');

  positionIcon(heading, icon);
  block.append(icon);

  block.querySelector(':scope > div').classList.add('info-content-wrapper');
  const content = block.querySelector(':scope > div > div');
  content.classList.add('info-content');

  await decorateIcons(block);
  heading.append(block);

  // Move the icon if the font size changes at the declared breakpoints.
  Object.values(BREAKPOINTS).forEach((mq) => {
    mq.addEventListener('change', () => positionIcon(heading, icon));
  });
}
