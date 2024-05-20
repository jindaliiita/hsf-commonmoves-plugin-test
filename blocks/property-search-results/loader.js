import { div, img, domEl } from '../../scripts/dom-helpers.js';

const loader = div({ class: 'search-results-loader' },
  div({ class: 'animation' },
    domEl('picture', img({ src: '/styles/images/loading.png' })),
    div({ class: 'pulse' }),
  ),
);

export default loader;
