import { readBlockConfig } from '../../scripts/aem.js';

// Get the communities from the community index
let queryIndex;
async function getQueryIndex() {
  if (!queryIndex) {
    const resp = await fetch('/communities/query-index.json');
    if (resp.ok) {
      queryIndex = await resp.json();
    }
  }
  return queryIndex;
}

// Filter communties based on input control
function filterFunction() {
  var input, filter, div, txtValue, a, i;
  input = document.getElementById('myInput');
  filter = input.value.toUpperCase();
  div = document.getElementById('myDropdown');
  a = div.getElementsByTagName('a');
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = '';
    } else {
      a[i].style.display = 'none';
    }
  }
}

// Show/hide the dropdown when clicking on the input field
function dropClick() {
  if (event.target.closest('.dropdown') !== null) {
    document.getElementById('myDropdown').style.display = 'block';
  }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('#myInput')) {
    var dropdowns = document.getElementsByClassName('dropdown-content');
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.style.display === 'block') {
        openDropdown.style.display = 'none';
      }
    }
  }
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';
  const index = await getQueryIndex();

  const list = document.createElement('div');
  list.classList.add('dropdown');

  const txtInput = document.createElement('input');
  txtInput.type = 'text';
  txtInput.placeholder = config.placeholder;
  txtInput.id = 'myInput';
  txtInput.addEventListener('input', filterFunction);
  block.addEventListener('click', dropClick);
  list.append(txtInput);

  const dropContent = document.createElement('div');
  dropContent.classList.add('dropdown-content');
  dropContent.id = 'myDropdown';

  index.data.forEach((community) => {
    const communityName = community['liveby-community'];
    const listItem = document.createElement('a');
    listItem.href = community.path;
    listItem.innerText = `${communityName.split(',')[0]} (${communityName})`;
    dropContent.append(listItem);
  });
  list.append(dropContent);
  block.append(list);
}
