import { close as closeCountrySelect } from '../../../shared/search-countries/search-countries.js';
import { BREAKPOINTS } from '../../../../scripts/scripts.js';
import { closeOnBodyClick, filterItemClicked } from '../../../shared/search/util.js';

const noOverlayAt = BREAKPOINTS.medium;

const fixOverlay = () => {
  if (noOverlayAt.matches) {
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.overflowY = null;
  }
};

const showFilters = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.closest('form').classList.add('show-filters');
  if (!noOverlayAt.matches) {
    document.body.style.overflowY = 'hidden';
  }
};

const closeFilters = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const thisForm = e.currentTarget.closest('form');
  thisForm.classList.remove('show-filters');
  thisForm.querySelectorAll('.select-wrapper.open').forEach((select) => {
    select.classList.remove('open');
  });
  document.body.style.overflowY = '';
};

const updateExpanded = (wrapper) => {
  const wasOpen = wrapper.classList.contains('open');
  const thisForm = wrapper.closest('form');
  thisForm.querySelectorAll('.open').forEach((item) => {
    item.classList.remove('open');
    item.querySelector('[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false');
  });
  if (!wasOpen) {
    wrapper.classList.add('open');
    wrapper.querySelector('[aria-expanded="false"]')?.setAttribute('aria-expanded', 'true');
  }
  closeOnBodyClick(thisForm);
};

function addEventListeners() {
  const form = document.querySelector('.hero.block form.homes');
  noOverlayAt.addEventListener('change', fixOverlay);

  form.querySelector('button.filter').addEventListener('click', showFilters);

  form.querySelectorAll('button.close').forEach((button) => {
    button.addEventListener('click', closeFilters);
  });

  form.querySelectorAll('.select-wrapper .selected').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const thisForm = e.currentTarget.closest('form');
      closeCountrySelect(thisForm);
      updateExpanded(e.currentTarget.closest('.select-wrapper'));
    });
  });

  form.querySelectorAll('.select-wrapper .select-items li').forEach((li) => {
    li.addEventListener('click', filterItemClicked);
  });
}

addEventListeners();
