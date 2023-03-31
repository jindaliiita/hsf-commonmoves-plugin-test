import { decorateIcons } from '../../scripts/lib-franklin.js';

const bp1 = window.matchMedia('(min-width: 600px)');
const bp2 = window.matchMedia('(min-width: 900px)');
const bp3 = window.matchMedia('(min-width: 1200px)');

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
  icon.classList.add('icon', 'icon-info_circle');

  positionIcon(heading, icon);
  block.append(icon);

  block.querySelector(':scope > div').classList.add('info-content-wrapper');
  const content = block.querySelector(':scope > div > div');
  content.classList.add('info-content');

  await decorateIcons(block);
  heading.append(block);

  // Move the icon if the font size changes at the declared breakpoints.
  bp1.addEventListener('change', () => positionIcon(heading, icon));
  bp2.addEventListener('change', () => positionIcon(heading, icon));
  bp3.addEventListener('change', () => positionIcon(heading, icon));
}
