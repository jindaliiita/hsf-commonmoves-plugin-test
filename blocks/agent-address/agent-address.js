import { getMetadata } from '../../scripts/aem.js';
import {
  a, div, p,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const streetAddress = getMetadata('street-address');
  const city = getMetadata('city');
  const state = getMetadata('state');
  const zip = getMetadata('zip');

  const textDiv = div({ class: 'address' },
    p('Berkshire Hathaway HomeServices'),
    p('Commonwealth Real Estate'),
    p(streetAddress),
    p(`${city}, ${state} ${zip}`),
  );
  const text = `${streetAddress}, ${city}, ${state} ${zip}`;

  const anchor = a({ href: `https://maps.google.com/maps?q=${text}`, target: '_blank' }, 'Directions');
  block.replaceChildren(textDiv, anchor);
}
