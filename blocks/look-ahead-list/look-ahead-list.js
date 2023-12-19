let queryIndex;
export async function getQueryIndex() {
  if (!queryIndex) {
    const resp = await fetch('/communities/query-index.json');
    if (resp.ok) {
      queryIndex = await resp.json();
    }
  }
  return queryIndex;
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

// Show/hide the dropdown when clicking on the input field
document.getElementById("myInput").addEventListener("click", function() {
  document.getElementById("myDropdown").style.display = "block";
});

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('#myInput')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.style.display === 'block') {
        openDropdown.style.display = 'none';
      }
    }
  }
}

export default async function decorate(block) {
  const index = await getQueryIndex();
/* <!-- Dropdown container -->
<div class="dropdown">
  <!-- Input field for lookahead filter -->
  <input type="text" id="myInput" oninput="filterFunction()" placeholder="Search for names">

  <!-- Dropdown content -->
  <div class="dropdown-content" id="myDropdown">
    <!-- Dropdown options -->
    <a href="#">John Doe</a>
    <a href="#">Jane Doe</a>
  </div>
</div> */
  index.data.forEach((community) => {
    const communityName = community['liveby-community'];
    block.append(list);
  });
}
