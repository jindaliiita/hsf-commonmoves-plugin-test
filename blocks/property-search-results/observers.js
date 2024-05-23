import Search, { UPDATE_SEARCH_EVENT } from '../../scripts/apis/creg/search/Search.js';
import { input } from '../../scripts/dom-helpers.js';
import ListingType from '../../scripts/apis/creg/search/types/ListingType.js';
import { closeOnBodyClick } from '../shared/search/util.js';

export default function observe(block) {
  block.querySelectorAll('a.map-view').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const blk = e.currentTarget.closest('.block');
      blk.classList.remove('list-view');
      blk.classList.add('map-view');
    });
  });

  block.querySelectorAll('a.list-view').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const blk = e.currentTarget.closest('.block');
      blk.classList.remove('map-view');
      blk.classList.add('list-view');
    });
  });

  block.querySelectorAll('.listing-types .filter-toggle').forEach((t) => {
    t.addEventListener('click', async (e) => {
      e.preventDefault();
      const { currentTarget } = e;
      const search = await Search.fromQueryString(window.location.search);
      const checked = currentTarget.querySelector('div.checkbox').classList.toggle('checked');
      const ipt = currentTarget.querySelector('input');
      input.checked = checked;
      if (checked) {
        search.addListingType(ipt.value);
      } else {
        search.removeListingType(ipt.value);
      }
      window.dispatchEvent(new CustomEvent(UPDATE_SEARCH_EVENT, { detail: { search } }));
    });
  });

  block.querySelector('.listing-types').addEventListener('click', (e) => {
    e.preventDefault();
    const ipt = e.target.closest('.filter-toggle')?.querySelector('input');
    if (ipt && ipt.value === ListingType.FOR_RENT.type) {
      e.currentTarget.querySelector(`input[value="${ListingType.PENDING.type}"]`).closest('.filter-toggle').classList.toggle('disabled');
    } else if (ipt && ipt.value === ListingType.PENDING.type) {
      e.currentTarget.querySelector(`input[value="${ListingType.FOR_RENT.type}"]`).closest('.filter-toggle').classList.toggle('disabled');
    }
  });

  const sortSelect = block.querySelector('.sort-options .select-wrapper div.selected');
  sortSelect.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const button = e.currentTarget;
    const wrapper = button.closest('.select-wrapper');
    const open = wrapper.classList.toggle('open');
    button.setAttribute('aria-expanded', open);
    if (open) {
      closeOnBodyClick(wrapper);
    }
  });

  sortSelect.querySelectorAll('.select-items li').forEach((opt) => {
    opt.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      const value = target.getAttribute('data-value');
      const wrapper = target.closest('.select-wrapper');
      wrapper.querySelector('.selected span').textContent = target.textContent;
      wrapper.querySelector('ul li.selected')?.classList.toggle('selected');
      const selected = wrapper.querySelector(`select option[value="${value}"]`);
      selected.selected = true;
      target.classList.add('selected');
      wrapper.classList.remove('open');
      wrapper.querySelector('[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false');
      const search = await Search.fromQueryString(window.location.search);
      search.sortBy = selected.getAttribute('data-sort-by');
      search.sortDirection = selected.getAttribute('data-sort-direction');
      window.dispatchEvent(new CustomEvent(UPDATE_SEARCH_EVENT, { detail: { search } }));
    });
  });
}
