import { showModal } from '../../scripts/util.js';

import loadMaps from '../../scripts/google-maps/index.js';

let autocompleteAttached = false;

export default async function decorate(block) {
  const form = document.createElement('form');
  form.setAttribute('action', '/home-value');
  form.innerHTML = `
    <div class="avm-input">
      <input type="text" name="avmaddress" placeholder="Enter Address" aria-label="Enter Address" autocomplete="off">
      <input type="text" name="avmunit" placeholder="Unit #" aria-label="Unit #" autocomplete="off">
    </div>
    <button type="submit" aria-label="Get Report">Get Report</button>
  `;

  const addressField = form.querySelector('input[name="avmaddress"]');

  addressField.addEventListener('focus', async () => {
    if (!autocompleteAttached) {
      loadMaps();
      await window.google.maps.importLibrary('places');
      // eslint-disable-next-line no-unused-vars
      const autocomplete = new window.google.maps.places.Autocomplete(addressField, {
        fields: ['formatted_address'],
        types: ['address'],
      });
      autocompleteAttached = true;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const address = addressField.value;
    if (!address) {
      showModal('Please enter valid address.<br/>Example: 1234 Main Street, Apt 123, New Milford, CT 06776');
      return;
    }

    let redirect = `/home-value?address=${address}`;

    const unit = form.querySelector('input[name="avmunit"]').value;
    if (unit) {
      redirect += `&unit=${unit}`;
    }
    window.location = redirect;
  });
  block.append(form);
}
