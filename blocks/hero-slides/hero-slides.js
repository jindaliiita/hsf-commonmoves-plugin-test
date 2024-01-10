import { createOptimizedPicture, readBlockConfig } from '../../scripts/lib-franklin.js';

/**
 * Slideshow with luxury listings. Supports swiping on touch screens.
 * Also supports manually adding content into the block.
 * @param block
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const  listings = await fetchListings(config);
  block.textContent = '';
  const { goToSlide } = setupSlideControls(block);

  const slideshowButtons = document.createElement('div');
  slideshowButtons.classList.add('slideshow-buttons');

  listings.forEach((listing, index) => {
    const slide = document.createElement('a');
    slide.classList.add('slide');
    slide.href = listing.PdpPath;

    const imageSizes = [
      // desktop
      { media: '(min-width: 600px)', height: '600' },
      // tablet and mobile sizes:
      { media: '(min-width: 400px)', height: '600' },
      { width: '400' },
    ];
    const picture = listing.picture || createOptimizedPicture(
      config[listing.ListingId],
      listing.City,
      index === 0,
      imageSizes,
    );
    slide.innerHTML = `
      <div class="image">${picture.outerHTML}</div>
      <div class="text">
      <p class="city">${plainText(listing.City)}</p>
      <p class="price">${plainText(listing.ListPriceUS)}</p>
      <a class="link" href='${listing.PdpPath}'>LEARN MORE</a>
      </div> `;
    block.append(slide);

    const button = document.createElement('button');
    button.ariaLabel = `go to listing in ${listing.City}`;
    button.addEventListener('click', () => goToSlide(index));
    slideshowButtons.append(button);

    if (index === 0) {
      slide.classList.add('active');
      button.classList.add('active');
    }
  });

  block.append(slideshowButtons);
}

async function fetchListings(config) {
  const resp = await fetch(`${window.hlx.codeBasePath}/drafts/rrusher/listings.json`);
  // eslint-disable-next-line no-return-await
  return (await resp.json()).data;
}

function setupSlideControls(block) {
  function goToSlide(index) {
    block.querySelector('.slide.active').classList.remove('active');
    [...block.querySelectorAll('.slide')].at(index).classList.add('active');

    block.querySelector('.slideshow-buttons .active')?.classList.remove('active');
    [...block.querySelectorAll('.slideshow-buttons button')].at(index).classList.add('active');

    // automatically advance slides. Reset timer when user interacts with the slideshow
    autoplaySlides();
  }

  let autoSlideInterval = null;
  function autoplaySlides() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => advanceSlides(+1), 3000);
  }

  function advanceSlides(diff) {
    const allSlides = [...block.querySelectorAll('.slide')];
    const activeSlide = block.querySelector('.slide.active');
    const currentIndex = allSlides.indexOf(activeSlide);

    const newSlideIndex = (allSlides.length + currentIndex + diff) % allSlides.length;
    goToSlide(newSlideIndex);
  }

  /** detect swipe gestures on touch screens to advance slides */
  function gestureStart(event) {
    const touchStartX = event.changedTouches[0].screenX;

    function gestureEnd(endEvent) {
      const touchEndX = endEvent.changedTouches[0].screenX;
      const delta = touchEndX - touchStartX;
      if (delta < -5) {
        advanceSlides(+1);
      } else if (delta > 5) {
        advanceSlides(-1);
      } else {
        // finger not moved enough, do nothing
      }
    }

    block.addEventListener('touchend', gestureEnd, { once: true });
  }

  block.addEventListener('touchstart', gestureStart, { passive: true });

  autoplaySlides();
  return { goToSlide };
}

/**
 * make text safe to use in innerHTML
 * @param text any string
 * @return {string} sanitized html string
 */
function plainText(text) {
  const fragment = document.createElement('div');
  fragment.append(text);
  return fragment.innerHTML;
}
