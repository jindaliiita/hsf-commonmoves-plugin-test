const isDesktop = window.matchMedia('(min-width: 600px)');

/**
 * Build the ToC from nav list.
 * @param block
 * @returns {Promise<void>}
 */
export default async function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-expanded', isDesktop.matches);
  nav.append(block.querySelector('p'));
  nav.append(block.querySelector('ul'));
  block.replaceChildren(nav);

  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', isDesktop.matches);
  });
}
