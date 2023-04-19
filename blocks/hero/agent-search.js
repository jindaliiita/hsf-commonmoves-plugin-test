import { BREAKPOINTS } from '../../scripts/scripts.js';

const getPlaceholder = () => (BREAKPOINTS.small.matches ? 'Search by Agent Name, Team Name, Location, Language or Designations' : 'Search by Name, Location and More...');

function buildForm() {
  const placeholder = getPlaceholder();

  const form = document.createElement('form');
  form.classList.add('agents');
  form.setAttribute('action', '/agent-search-results');

  form.innerHTML = `
    <div class="search-bar" role="search">
      <div class="search-suggester">
        <input type="text" placeholder="${placeholder}" aria-label="${placeholder}">
        <ul class="suggester-results">
          <li>Please enter at least 3 characters.</li>
        </ul>
      </div>
      <button class="search-submit" aria-label="Search Homes" type="submit">
        <span>Search</span>
      </button>
    </div>
  `;

  BREAKPOINTS.small.addEventListener('change', () => {
    const text = getPlaceholder();
    const input = form.querySelector('input');
    input.setAttribute('placeholder', text);
    input.setAttribute('aria-label', text);
  });

  return form;
}

const agents = {
  buildForm,
};

export default agents;
