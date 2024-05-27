import { getMetadata } from '../../scripts/aem.js';
import { button, div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const leftArrow = button({ class: 'testimonials-arrow left-arrow' }, '<');
  const testimonialsInner = div({ class: 'testimonials-inner' });
  const testimonialsWrapper = div({ class: 'testimonials' }, testimonialsInner);
  const rightArrow = button({ class: 'testimonials-arrow right-arrow' }, '>');
  const testimonialsCounter = div({ class: 'testimonials-counter' });
  block.append(leftArrow, testimonialsWrapper, rightArrow, testimonialsCounter);

  let currentIndex = 0;
  let totalReviews = 0;
  const updateCounter = () => {
    testimonialsCounter.textContent = `${currentIndex + 1} of ${totalReviews}`;
  };

  const addReadMoreFunctionality = () => {
    const reviewTexts = document.querySelectorAll('.review-text');
    reviewTexts.forEach((reviewText) => {
      const words = reviewText.textContent.split(' ');
      if (words.length > 75) {
        const initialText = words.slice(0, 50).join(' ');
        const remainingText = words.slice(50).join(' ');
        const readMore = document.createElement('span');
        readMore.classList.add('read-more');
        readMore.textContent = '... Read more';

        reviewText.innerHTML = `${initialText}<span class="remaining-text">${remainingText}</span>`;
        reviewText.appendChild(readMore);
        reviewText.querySelector('.remaining-text').style.display = 'none';

        readMore.addEventListener('click', () => {
          const remainingTextSpan = reviewText.querySelector('.remaining-text');
          if (remainingTextSpan.style.display === 'none') {
            remainingTextSpan.style.display = 'inline';
            readMore.textContent = ' Show less';
          } else {
            remainingTextSpan.style.display = 'none';
            readMore.textContent = '... Read more';
          }
        });
      }
    });
  };

  const externalID = getMetadata('externalid');
  fetch(`https://testimonialtree.com/Widgets/jsonFeed.aspx?widgetid=45133&externalID=${externalID}`)
    .then((response) => response.json())
    .then((data) => {
      const reviews = data.testimonialtreewidget.testimonials.testimonial.slice(0, 4);
      totalReviews = reviews.length;
      reviews.forEach((review) => {
        const reviewElement = div({ class: 'testimonials-item' },
          div({ class: 'rating-stars' }, '★'.repeat(review.rating)),
          div({ class: 'review-text-container' },
            div({ class: 'review-text' }, decodeURIComponent(review.testimonial.replace(/\+/g, ' '))),
          ),
          div({ class: 'reviewer-name' }, review.signature.replace(/\+/g, ' ') || 'Anonymous'),
        );
        testimonialsInner.appendChild(reviewElement);
      });
      addReadMoreFunctionality();
      updateCounter();
    });

  const updatetestimonials = () => {
    testimonialsInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateCounter();
  };

  leftArrow.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalReviews - 1;
    updatetestimonials();
  });

  rightArrow.addEventListener('click', () => {
    currentIndex = (currentIndex < totalReviews - 1) ? currentIndex + 1 : 0;
    updatetestimonials();
  });
}
