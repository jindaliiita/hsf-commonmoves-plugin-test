import { getMetadata } from '../../scripts/aem.js';
import {
  a, div, p,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const streetAddress = getMetadata('streetaddress');
  const addressLocality = getMetadata('addresslocality');
  const addressRegion = getMetadata('addressregion');
  const postalCode = getMetadata('postalcode');

  const textDiv = div({ class: 'address' },
    p('Berkshire Hathaway HomeServices'),
    p('Commonwealth Real Estate'),
    p(streetAddress),
    p(`${addressLocality}, ${addressRegion} ${postalCode}`),
  );
  const text = `${streetAddress}, ${addressLocality}, ${addressRegion} ${postalCode}`;

  const anchor = a({ href: `https://maps.google.com/maps?q=${text}`, target: '_blank' }, 'Directions');
  block.replaceChildren(textDiv, anchor);
}
