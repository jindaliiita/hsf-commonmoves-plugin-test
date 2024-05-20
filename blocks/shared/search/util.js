import { getMetadata } from '../../../scripts/aem.js';

export const BED_BATHS = [
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

export function getPlaceholder() {
  const country = getMetadata('country') || 'US';
  return country === 'US' ? 'Enter City, Address, Zip/Postal Code, Neighborhood, School or MLS#' : 'Enter City';
}

let bodyCloseListener;
/**
 * Helper function to close an expanded item when click events occur elsewhere on the page.
 * @param {HTMLElement} root context for closing elements
 */
export function closeOnBodyClick(root) {
  if (bodyCloseListener) {
    document.body.removeEventListener('click', bodyCloseListener);
  }
  bodyCloseListener = (e) => {
    // Don't close if we clicked somewhere inside of the context.
    if (root.contains(e.target)) {
      return;
    }
    root.classList.remove('open');
    root.querySelectorAll('.open').forEach((open) => open.classList.remove('open'));
    root.querySelectorAll('[aria-expanded="true"]').forEach((expanded) => expanded.setAttribute('aria-expanded', 'false'));
    document.body.removeEventListener('click', bodyCloseListener);
    bodyCloseListener = undefined;
  };
  document.body.addEventListener('click', bodyCloseListener);
}

/**
 * Creates a Select dropdown for filtering search.
 * @param {String} name name of select
 * @param {String} placeholder label
 * @param {Array[Object]} options max number of options
 * @param {String} options.value value for option entry
 * @param {String} options.label label for option entry
 * @returns {HTMLDivElement}
 */
export function buildFilterSelect(name, placeholder, options) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('select-wrapper', name);
  wrapper.innerHTML = `
    <select name="${name}" aria-label="${placeholder}">
      <option value="">Any ${placeholder}</option>
    </select>
    <div class="selected" role="button" aria-haspopup="listbox" aria-label="${placeholder}" aria-expanded="false" tabindex="0"><span>Any ${placeholder}</span></div>
    <ul class="select-items" role="listbox">
      <li role="option" class="selected" data-value="">Any ${placeholder}</li>
    </ul>
  `;

  const select = wrapper.querySelector('select');
  const ul = wrapper.querySelector('ul');
  options.forEach((option) => {
    const ele = document.createElement('option');
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('data-value', option.value);
    ele.value = option.value;
    // eslint-disable-next-line no-multi-assign
    ele.textContent = li.textContent = `${option.label} ${placeholder}`;
    select.append(ele);
    ul.append(li);
  });
  return wrapper;
}

export function filterItemClicked(e) {
  e.preventDefault();
  e.stopPropagation();
  const value = e.currentTarget.getAttribute('data-value');
  const wrapper = e.currentTarget.closest('.select-wrapper');
  wrapper.querySelector('.selected span').textContent = e.currentTarget.textContent;
  wrapper.querySelector('ul li.selected')?.classList.toggle('selected');
  e.currentTarget.classList.add('selected');
  wrapper.querySelectorAll('select option').forEach((o) => { o.selected = false; });
  if (!value) {
    wrapper.querySelector('select option[value=""]').selected = true;
  } else {
    wrapper.querySelector(`select option[value="${value}"]`).selected = true;
  }
  wrapper.classList.remove('open');
  wrapper.querySelector('[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false');
}

/**
 * Creates a from/to range input field for the search filter
 * @param name parameter name
 * @param placeholder label
 */
export function buildDataListRange(name, placeholder) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('range-wrapper', name);
  wrapper.innerHTML = `
    <div class="selected" role="button" aria-haspopup="listbox" aria-label="${placeholder}" aria-expanded="false" tabindex="0"><span>${placeholder}</span></div>
    <div class="range-items">
      <div id="min-${name}" class="input-dropdown">
        <input type="text" name="min-${name}" maxlength="14" aria-describedby="min-${name}" aria-label="Minimum ${name}" placeholder="No Min" list="list-min-${name}">
        <datalist id="list-min-${name}"></datalist> 
      </div> 
      <span>to</span>
      <div id="max-${name}" class="input-dropdown">
        <input type="text" name="max-${name}" maxlength="14" aria-describedby="max-${name}" aria-label="Maximum ${name}" placeholder="No Max" list="list-max-${name}">
        <datalist id="list-max-${name}"></datalist> 
      </div> 
    </div>
  `;
  return wrapper;
}

/**
 * Creates a from/to range input field with selections for the options
 * @param name parameter name
 * @param placeholder placeholder
 * @param boundaries boundaries for ranges.
 */
export function buildSelectRange(name, placeholder, boundaries) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('range-wrapper', name);
  wrapper.innerHTML = `
    <div class="selected" role="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${placeholder}" tabindex="0"><span>${placeholder}</span></div>
    <div class="range-items">
      <div id="min-${name}" class="select-wrapper">
        <select name="min-${name}" aria-label="No Min">
          <option value="">No Min</option>
        </select>
        <div class="selected" role="combobox" aria-haspopup="listbox" aria-label="No Min" aria-expanded="false" aria-controls="list-min-${name}" tabindex="0"><span>No Min</span></div>
        <ul id="list-min-${name}" class="select-items" role="listbox">
          <li data-value="" role="option" class="selected">No Min</li>
        </ul>
      </div>
      <span>to</span>
      <div id="max-${name}" class="select-wrapper">
        <select name="${name}" aria-label="No Max">
          <option value="">No Max</option>
        </select>
        <div class="selected" role="combobox" aria-haspopup="listbox" aria-label="No Max" aria-expanded="false" aria-controls="list-max-${name}" tabindex="0"><span>No Max</span></div>
        <ul id="list-max-${name}" class="select-items" role="listbox">
          <li data-value="" role="option" class="selected">No Max</li>
        </ul>
      </div>
    </div>
  `;

  wrapper.querySelectorAll(`#min-${name}, #max-${name}`).forEach((item) => {
    boundaries.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.value;
      opt.textContent = b.label;
      item.querySelector('select').append(opt);
      const li = document.createElement('li');
      li.setAttribute('data-value', b.value);
      li.setAttribute('role', 'option');
      li.textContent = b.label;
      item.querySelector('ul').append(li);
    });
  });
  return wrapper;
}
