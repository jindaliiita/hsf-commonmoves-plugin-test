/* eslint comma-dangle: "off" */
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
    (child) => child.getAttribute('active') === 'true'
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
  const prevButton = block.querySelector(
    '.controls-container button[name="prev"]'
  );
  const nextButton = block.querySelector(
    '.controls-container button[name="next"]'
  );
  const indexElement = block.querySelector('.controls-container .index');
  indexElement.textContent = nextIndex + 1;
  if (currentIndex === 0) {
    // enable previous button
    prevButton.removeAttribute('disabled');
  } else if (nextIndex === 0) {
    indexElement.dispatchEvent(event);
    // disable previous button
    prevButton.setAttribute('disabled', true);
  } else if (nextIndex === numChildren[key] - 1) {
    // disable next button
    nextButton.setAttribute('disabled', true);
    stopAutoScroll(block);
  } else if (currentIndex === numChildren[key] - 1) {
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
 * Configure all the event handlers and auto-scroll for a carousel
 *
 * @param {Element} block
 */
function initCarousel(block) {
  const blockId = block.getAttribute('id');
  const slidesContainer = block.querySelector('.carousel-content');
  numChildren[blockId] = [...block.querySelectorAll('.item')].length;
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
      (((currentIndex - 1) % numChildren[blockId])
        + numChildren[blockId]) % numChildren[blockId],
      block
    );
  });
  indexElement.addEventListener('startAutoScroll', () => {
    startAutoScroll(block);
  });
  indexElement.dispatchEvent(event);
}

/**
 * Locate all quote carousels and initalize their event handlers
 *
 */
function init() {
  [...document.querySelectorAll('.block.quote-carousel')].forEach(
    initCarousel
  );
}

init();
