import { BREAKPOINTS } from '../../scripts/scripts.js';

const isDesktop = BREAKPOINTS.medium;

export default async function decorate(block) {
  const selectedCategoryUrl = window.location.href;
  const blogNav = document.createElement('nav');
  const blogNavContent = block.querySelector(':scope > div:last-of-type');
  const selectedCategoryEl = document.createElement('div');
  let categoryName = 'Blog Categories';
  selectedCategoryEl.classList.add('blog-nav-selected');
  blogNav.classList.add('blog-nav', 'text-up');

  [...blogNavContent.querySelector('div').children].forEach((child) => {
    if (child.querySelector('li')) {
      [...child.children].forEach((category) => {
        if (selectedCategoryUrl.includes(category.querySelector('a').href)) {
          category.classList.add('selected-cat');
          categoryName = category.textContent;
        }
      });
      selectedCategoryEl.innerHTML = ` <span>${categoryName}</span> <img src="/icons/dropdown-icon.svg" alt="dropdown-icon" class="category-dropdown-icon">`;
      blogNav.appendChild(selectedCategoryEl);
    }
    blogNav.appendChild(child);
  });
  block.replaceChildren(blogNav);
  const categoriesList = block.querySelector('ul');

  selectedCategoryEl.addEventListener('click', () => {
    categoriesList.classList.toggle('visible');
  });

  isDesktop.addEventListener('change', () => categoriesList.classList.remove('visible'));
}
