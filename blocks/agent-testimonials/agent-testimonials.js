import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const div = document.createElement('div');
  div.classList.add('testimonials-container');
  div.innerHTML = `<button class="testimonials-arrow left-arrow">&lt;</button>
    <div class="testimonials">
       <div class="testimonials-inner" id="testimonials-inner">
          <!-- Reviews will be injected here by JavaScript -->
       </div>
    </div>
    <button class="testimonials-arrow right-arrow">&gt;</button>
    <div class="testimonials-counter" id="testimonials-counter"></div>`;
  block.append(div);
  const testimonialsInner = document.getElementById('testimonials-inner');
  const testimonialsCounter = document.getElementById('testimonials-counter');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  let currentIndex = 0;
  let totalReviews = 0;

  const updateCounter = () => {
    testimonialsCounter.textContent = `${currentIndex + 1} of ${totalReviews}`;
  };

  const addReadMoreFunctionality = () => {
    const reviewTexts = document.querySelectorAll('.review-text');
    reviewTexts.forEach((reviewText) => {
      const words = reviewText.textContent.split(' ');
      if (words.length > 100) {
        const initialText = words.slice(0, 100).join(' ');
        const remainingText = words.slice(100).join(' ');
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
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('testimonials-item');
        reviewElement.innerHTML = `
          <div class="rating-stars">${'★'.repeat(review.rating)}</div>
          <div class="review-text-container">
             <div class="review-text">
                  ${decodeURIComponent(review.testimonial.replace(/\+/g, ' '))}
             </div>
          </div>
          <div class="reviewer-name">${review.signature.replace('+', ' ') || 'Anonymous'}</div>
       `;
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
