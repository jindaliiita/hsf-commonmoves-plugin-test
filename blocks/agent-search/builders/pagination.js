export const PER_PAGE_PARAM = 'perPage';
export const PAGE_PARAM = 'page';

/**
 * The selector for the pagination div.
 *
 * @type {string}
 */
export const PAGINATION_SELECTOR = '.pagination';

/**
 * Builds the Pagination.
 *
 * @param {number} agentCount total count of agents in search results
 * @param {function} searchCallback the function to register when a search needs to be performed
 *
 * @return {Promise<HTMLDivElement>}
 */
export const buildPagination = async (agentCount, searchCallback) => {
  const urlParams = new URLSearchParams(window.location.search);
  let perPage = parseInt(urlParams.get(PER_PAGE_PARAM), 10) || 10;
  if (perPage % 10 !== 0) {
    perPage += 10 - (perPage % 10);
  }
  const page = parseInt(urlParams.get(PAGE_PARAM), 10) || 1;

  const prevEnabled = page !== 1;
  const nextEnabled = agentCount > (page + 1) * perPage;

  const totalPages = Math.ceil(agentCount / perPage);

  const pagination = document.createElement('div');
  pagination.classList.add('pagination');
  pagination.innerHTML = `
    <div class="per-page-select-wrapper select-wrapper">
      <label for="per-page" role="presentation">View per page</label>
      <select id="per-page"></select>
      <div class="selected-per-page" role="button" aria-haspopup="listbox" tabindex="0">${perPage}</div>
      <ul class="per-page-options" role="listbox" aria-expanded="false">
      </ul>
    </div>
    <div class="page">
      <div class="page-select-wrapper select-wrapper">
        <select id="page"></select>
        <div class="selected-page" role="button" aria-haspopup="listbox" tabindex="0">${page} of ${totalPages}</div>
        <ul class="page-options" role="listbox" aria-expanded="false">
        </ul>
      </div>
      <div class="prev-next">
        <a class="prev ${prevEnabled ? 'enabled' : ''}" role="button" aria-label="Previous Page"></a>
        <a class="next ${nextEnabled ? 'enabled' : ''}" role="button" aria-label="Next Page"></a>
      </div>
    </div>
  `;

  // Per Page list
  const perPageSelect = pagination.querySelector('select#per-page');
  const perPageUl = pagination.querySelector('ul.per-page-options');
  for (let i = 10; i <= 50; i += 10) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    perPageSelect.append(option);

    const li = document.createElement('li');
    li.classList.add('per-page-item');
    li.setAttribute('data-value', i);
    li.textContent = i;
    perPageUl.append(li);

    if (i === perPage) {
      li.classList.add('highlighted');
    }
  }
  perPageSelect.value = perPage;
  pagination.querySelector('.selected-per-page').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    perPageUl.setAttribute('aria-expanded', perPageUl.classList.toggle('visible'));
  });
  perPageUl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    perPageUl.setAttribute('aria-expanded', perPageUl.classList.toggle('visible'));
    const perPageCount = e.target.getAttribute('data-value');
    perPageSelect.value = perPageCount;
    urlParams.set(PER_PAGE_PARAM, perPageCount);
    searchCallback(urlParams);
  });

  // Page List
  const pageSelect = pagination.querySelector('select#page');
  const pageUl = pagination.querySelector('ul.page-options');
  for (let i = 1; i <= totalPages; i += 1) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    pageSelect.append(option);

    const li = document.createElement('li');
    li.classList.add('page-item');
    li.setAttribute('data-value', i);
    li.textContent = i;
    pageUl.append(li);
    if (i === page) {
      li.classList.add('highlighted');
    }
  }
  pageSelect.value = page;
  pagination.querySelector('.selected-page').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pageUl.setAttribute('aria-expanded', pageUl.classList.toggle('visible'));
  });
  pageUl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pageUl.setAttribute('aria-expanded', pageUl.classList.toggle('visible'));
    const pageNumber = e.target.getAttribute('data-value');
    pageSelect.value = pageNumber;
    urlParams.set(PAGE_PARAM, pageNumber);
    searchCallback(urlParams);
  });

  pagination.querySelector('a.next').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pageNumber = parseInt(urlParams.get(PAGE_PARAM), 10) || 1;
    urlParams.set(PAGE_PARAM, pageNumber + 1);
    searchCallback(urlParams);
  });

  pagination.querySelector('a.prev').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pageNumber = parseInt(urlParams.get(PAGE_PARAM), 10) - 1;
    urlParams.set(PAGE_PARAM, pageNumber);
    searchCallback(urlParams);
  });

  return pagination;
};
