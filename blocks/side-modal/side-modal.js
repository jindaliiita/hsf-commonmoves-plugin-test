/* eslint-disable import/prefer-default-export */
import {
  decorateSections, decorateBlocks, loadBlocks, decorateButtons, decorateIcons, loadCSS,
} from '../../scripts/aem.js';

export async function showSideModal(a) {
  const { href } = a;
  const module$ = import(`${window.hlx.codeBasePath}/scripts/util.js`);
  await loadCSS(`${window.hlx.codeBasePath}/blocks/side-modal/side-modal.css`);
  const content = await fetch(`${href}.plain.html`);

  async function decorateSideModal(container) {
    decorateButtons(container);
    decorateIcons(container);
    decorateSections(container);
    decorateBlocks(container);

    container.classList.add('side-modal-form');
    const [theForm] = container.children;
    theForm.classList.add('form');

    await loadBlocks(container);
  }

  if (content.ok) {
    const html = await content.text();
    const fragment = document.createRange().createContextualFragment(html);
    const [module] = await Promise.all([module$]);
    module.showSideModal(fragment.children, decorateSideModal);
  }
}
