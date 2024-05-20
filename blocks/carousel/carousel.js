export default function decorate(block) {
    const div = document.createElement('div');
    div.classList.add('carousel-container');
    div.innerHTML = `<button class="carousel-arrow left-arrow">&lt;</button>
        <div class="carousel">
            <div class="carousel-inner" id="carousel-inner">
                <!-- Reviews will be injected here by JavaScript -->
            </div>
        </div>
        <button class="carousel-arrow right-arrow">&gt;</button>
        <div class="carousel-counter" id="carousel-counter"></div>`;
    block.append(div);
    const carouselInner = document.getElementById('carousel-inner');
    const carouselCounter = document.getElementById('carousel-counter');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    let currentIndex = 0;
    let totalReviews = 0;

    fetch('https://api.bridgedataoutput.com/api/v2/OData/reviews/Reviews?access_token=f1484460e98c42240bade7f853c488ed')
        .then(response => response.json())
        .then(data => {
            const reviews = data.value.slice(0, 4);
            totalReviews = reviews.length;
            reviews.forEach((review, index) => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('carousel-item');
                reviewElement.innerHTML = `
                    <div class="rating-stars">${'★'.repeat(review.Rating)}</div>
                    <div class="review-text-container">
                        <div class="review-text">
                            ${review.Description}
                        </div>
                    </div>
                    <div class="reviewer-name">${review.ReviewerScreenName || 'Anonymous'}</div>
                `;
                carouselInner.appendChild(reviewElement);
            });
            addReadMoreFunctionality();
            updateCounter();
        });

    const updateCarousel = () => {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateCounter();
    };

    const updateCounter = () => {
        carouselCounter.textContent = `${currentIndex + 1} of ${totalReviews}`;
    };

    const addReadMoreFunctionality = () => {
        const reviewTexts = document.querySelectorAll('.review-text');
        reviewTexts.forEach(reviewText => {
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

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalReviews - 1;
        updateCarousel();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex < totalReviews - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });
}