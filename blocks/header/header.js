import { BREAKPOINTS } from '../../scripts/scripts.js';
import { getMetadata, decorateIcons, decorateSections } from '../../scripts/lib-franklin.js';

// media query match that indicates mobile/tablet width
const isDesktop = BREAKPOINTS.large;

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * Builds the Logo Div.
 * @returns {HTMLDivElement}
 */
function buildLogo() {
  // Add the Logo.
  const logo = document.createElement('div');
  logo.classList.add('nav-logo');
  logo.innerHTML = `
      <a href="/" rel="noopener">
        <img alt="Logo" class="logo" src="/styles/images/logo-black.svg" loading="lazy" width="216" height="35"/>
      </a>
    `;
  return logo;
}

/**
 * Adds the Profile submenu to the Nav.
 * @param {HTMLDivElement} nav
 */
function addProfileLogin(nav) {
  const profileList = nav.querySelector('.nav-profile ul');

  const profileMenu = document.createElement('ul');
  profileMenu.innerHTML = `
    <li class="login">
      <a href="#">Sign In</a>
    </li>
    <li class="username">
      <a href="#">{Username}</a>
    </li>

    <li class="user-menu">
      <a href="#">Back</a>
      <ul>
         <li class="profile"><a href="#">Profile</a></li>
         <li class="logout"><a href="#">Sign out</a></li>
      </ul>
    </li>
  `;
  profileList.prepend(...profileMenu.childNodes);
}

/**
 * Builds the hamburger menu Div.
 * @returns {HTMLDivElement}
 */
function buildHamburger() {
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  const icon = document.createElement('div');
  icon.classList.add('nav-hamburger-icon');
  icon.innerHTML = `
      <svg class="open" role="img" aria-hidden="true" tabindex="-1" aria-label="Open Navigation">
        <use id="hamburger-icon" xlink:href="/icons/icons.svg#hamburger-white"></use>
      </svg>
      <svg class="close" role="img" aria-hidden="true" tabindex="-1" aria-label="Close Navigation">
        <use id="close-hamburger-icon" xlink:href="/icons/icons.svg#close-x"></use>
      </svg>
    `;
  hamburger.append(icon);
  return hamburger;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = document.createElement('div');
    html.innerHTML = await resp.text();

    const nav = document.createElement('nav');

    const primaryWrapper = document.createElement('div');
    primaryWrapper.classList.add('nav-primary-wrapper');
    nav.append(primaryWrapper);

    primaryWrapper.append(buildLogo());

    // Add Nav sections.
    decorateSections(html);
    html.querySelectorAll('.section[data-section]').forEach((section) => {
      const clazz = section.getAttribute('data-section');
      const wrapper = section.children[0];
      wrapper.classList.replace('default-content-wrapper', `nav-${clazz}`);
    });

    nav.append(html.querySelector('.nav-profile'));
    primaryWrapper.append(html.querySelector('.nav-sections'));

    addProfileLogin(nav);

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        const submenu = navSection.querySelector('ul');
        if (submenu) {
          navSection.classList.add('nav-drop');
          const cover = document.createElement('div');
          cover.classList.add('cover');
          submenu.insertAdjacentElement('beforebegin', cover);
        }
        navSection.addEventListener('click', (e) => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            if (!expanded && submenu) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        });
      });
      document.body.addEventListener('click', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
        }
      });
    }
    const hamburger = buildHamburger();
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.append(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    decorateIcons(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.querySelector(':scope > div').replaceWith(navWrapper);
  }
}
