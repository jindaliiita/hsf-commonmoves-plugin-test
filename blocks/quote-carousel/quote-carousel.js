const DEFAULT_SCROLL_INTERVAL_MS = 6000;
const numChildren = {};
const scrollInterval = {};
const event = new Event('startAutoScroll');

/**
 * Get key to retrieve data for carousel block
 *
 * @param {Element} block
 * @returns {string}
 */
function getBlockId(block) {
  return block.id;
}

/**
 * Stop auto-scroll animation
 *
 * @param {Element} block
 */
function stopAutoScroll(block) {
  const key = getBlockId(block);
  const interval = scrollInterval[key];
  clearInterval(interval);
  scrollInterval[key] = undefined;
}

/**
 * Return index for active slide
 *
 * @param {Element} block
 * @returns {number}
 */
function getCurrentSlideIndex(block) {
  return [...block.querySelectorAll('.carousel-content .item')].findIndex(
    (child) => child.getAttribute('active') === 'true',
  );
}

/**
 * Switch between slides
 *
 * @param {number} nextIndex
 * @param {Element} block
 */
function switchSlide(nextIndex, block) {
  const key = getBlockId(block);
  const slidesContainer = block.querySelector('.carousel-content');
  const currentIndex = getCurrentSlideIndex(slidesContainer);
  const prevButton = block.querySelector('.controls-container button[name="prev"]');
  const nextButton = block.querySelector('.controls-container button[name="next"]');
  const indexElement = block.querySelector('.controls-container .index');
  indexElement.textContent = nextIndex + 1;
  if (currentIndex === 0) {
    // enable previous button
    prevButton.removeAttribute('disabled');
  } else if (nextIndex === 0) {
    indexElement.dispatchEvent(event);
    // disable previous button
    prevButton.setAttribute('disabled', true);
  } else if (nextIndex === (numChildren[key] - 1)) {
    // disable next button
    nextButton.setAttribute('disabled', true);
    stopAutoScroll(block);
  } else if (currentIndex === (numChildren[key] - 1)) {
    // disable next button
    nextButton.removeAttribute('disabled');
  }
  slidesContainer.children[currentIndex].removeAttribute('active');
  slidesContainer.children[nextIndex].setAttribute('active', true);
  slidesContainer.style.transform = `translateX(-${nextIndex * 100}%)`;
}

/**
 * Start auto scroll
 *
 * @param {Element} block
 * @param {number} interval
 */
function startAutoScroll(block, interval = DEFAULT_SCROLL_INTERVAL_MS) {
  const key = getBlockId(block);
  scrollInterval[key] = setInterval(() => {
    const currentIndex = getCurrentSlideIndex(block);
    switchSlide((currentIndex + 1) % numChildren[key], block);
  }, interval);
}

/**
 * Returns block content from the spreadsheet
 *
 * @param {Element} block
 * @returns {Promise<any>}
 */
async function getContent(block) {
  const url = block.querySelector('div > div > div:nth-child(2) > a').href;
  let data = { data: [] };
  try {
    const resp = await fetch(url);
    if (resp.ok) {
      data = resp.json();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load block content', error);
  }
  return data;
}

export default async function decorate(block) {
  const blockId = crypto.randomUUID();
  const content = await getContent(block);
  // generate carousel content from loaded data
  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('carousel-content');
  block.setAttribute('id', blockId);
  numChildren[blockId] = content.total;
  block.innerHTML = '';
  if (content.data.length > 0) {
    [...content.data].forEach((row) => {
      const rowContent = document.createElement('div');
      rowContent.classList.add('item');
      rowContent.innerHTML = `
                <p class="quote">"${row.quote}"</p>
                <p class="author">${row.author}</p>
                <p class="position">${row.position}</p>
                `;
      rowContent.classList.add('item');
      slidesContainer.appendChild(rowContent);
    });
    slidesContainer.children[0].setAttribute('active', true);

    // generate container for carousel controls
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('controls-container');
    controlsContainer.innerHTML = `
    <div class="pagination">
        <span class="index">1</span>
        &nbsp;of&nbsp;
        <span class="total">${numChildren[blockId]}</span>
    </div>
    <button name="prev" aria-label="Previous" class="control-button" disabled><svg><use xlink:href="/icons/icons.svg#carrot"/></svg></button>
    <button name="next" aria-label="Next" class="control-button"><svg><use xlink:href="/icons/icons.svg#carrot"/></svg></button>
  `;
    block.replaceChildren(slidesContainer, controlsContainer);

    const nextButton = block.querySelector('button[name="next"]');
    const prevButton = block.querySelector('button[name="prev"]');
    const indexElement = block.querySelector('.index');
    nextButton.addEventListener('click', () => {
      const currentIndex = getCurrentSlideIndex(slidesContainer);

      switchSlide((currentIndex + 1) % numChildren[blockId], block);
    });
    prevButton.addEventListener('click', () => {
      const currentIndex = getCurrentSlideIndex(slidesContainer);
      switchSlide(
        (((currentIndex - 1) % numChildren[blockId]) + numChildren[blockId]) % numChildren[blockId],
        block,
      );
    });
    indexElement.addEventListener('startAutoScroll', () => {
      startAutoScroll(block);
    });
    indexElement.dispatchEvent(event);
  }
}
