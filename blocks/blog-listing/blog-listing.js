import {
  readBlockConfig,
} from '../../scripts/lib-franklin.js';

const urlParams = new URLSearchParams(window.location.search);
export const API_HOST = urlParams.get('env') === 'stage' ? 'https://ignite-staging.bhhs.com' : 'https://www.bhhs.com';

const DEFAULT_SCROLL_INTERVAL_MS = 6000;
const DEFAULT_DESCRIPTION_LENGTH = 141;
const category = window.location.pathname.split('/').filter(Boolean)[1] ?? '';
let numCarouselItems;
let numBlogItems;
const loadMoreCount = 6;
let loadOffset = 0;
const event = new Event('startAutoScroll');
let scrollInterval;

function buildApiPath(offset, count) {
  let url;
  if (category === '') {
    url = `${API_HOST}/content/bhhs-franchisee/ma312/en/us/blog/jcr:content/root/blog_home.blogs.offset_${offset}.count_${count}.json`;
  } else {
    url = `${API_HOST}/content/bhhs-franchisee/ma312/en/us/blog/blog-category/jcr:content/root/blog_category.blogCategory.category_${category}.offset_${offset}.count_${count}.json`;
  }
  return url;
}

async function getData(dataKey, offset, count) {
  const url = buildApiPath(offset, count);
  const resp = await fetch(url, {
    headers: {
      accept: '*/*',
    },
    referrerPolicy: 'no-referrer',
    body: null,
    method: 'GET',
  });
  let data = [];
  if (resp.ok) {
    data = await resp.json();
    data = data[dataKey];
    loadOffset += count;
  }
  return data;
}

function trimDescription(description) {
  const trimmedDescription = description.replace(/(<([^>]+)>)/ig, '');
  return `${trimmedDescription.substring(0, DEFAULT_DESCRIPTION_LENGTH)}...`;
}

function buildImageUrl(path) {
  return new URL(`${API_HOST}${path}`).href;
}

function prepareBlogArticleUrl(link) {
  return link.replace(/\.html$/, '');
}

function buildBlogItem(block, data, addClass = false) {
  const itemCategory = data.category;
  const {
    description, image, link, mobileImage, tabletImage, title,
  } = data;
  const blogContainer = document.createElement('div');
  // @todo can we change variable name(????)
  blogContainer.classList.add('blog-item');
  if (addClass) {
    const clazz = itemCategory.toLocaleLowerCase().replace(/\s+/g, '-');
    blogContainer.classList.add(clazz);
  }
  blogContainer.innerHTML = `
    <div class="image-content">
      <picture>
        <source media="(max-width:767px)" srcset="${buildImageUrl(mobileImage)}">
        <source media="(min-width:768px) and (max-width:1279px)" srcset="${buildImageUrl(tabletImage)}">
        <img src="${buildImageUrl(image)}" class="image" aria-label="${title}" alt="${title}">
      </picture>
    </div>
    <div class="blog-content">
      <p class="blog-category text-up">${itemCategory}</p>
      <p class="title">${title}</p>
      <div class="description"><p>${trimDescription(description)}</p></div> 
      <a href="${prepareBlogArticleUrl(link)}" target="_blank" class="readmore text-up">read more
      <img src="/icons/arrow-back.svg"  aria-hidden="true" alt="Read More" class="arrowIcon" width="12" height="12"></a>
    </div>
    `;
  block.append(blogContainer);
}

function buildSeeMoreContentButton(block, dataKey) {
  const buttonContainer = document.createElement('button');
  const blogsGridContainer = block.querySelector('.blogs-grid-list');
  buttonContainer.classList.add('see-more-content', 'text-up');
  buttonContainer.type = 'submit';
  buttonContainer.innerText = 'see more content';
  buttonContainer.addEventListener('click', async () => {
    buttonContainer.disabled = true;
    const articles = await getData(dataKey, loadOffset, loadMoreCount);
    articles.forEach((blog) => {
      buildBlogItem(blogsGridContainer, blog);
    });
    if (articles.length > 0 && articles.length === loadMoreCount) {
      buttonContainer.disabled = false;
    } else {
      buttonContainer.remove();
    }
  });
  block.append(buttonContainer);
}

function getCurrentSlideIndex(block) {
  return [...block.querySelectorAll('.carousel-list .blog-item')].findIndex(
    (child) => child.getAttribute('active') === 'true',
  );
}

function switchSlide(nextIndex, block) {
  const slidesContainer = block.querySelector('.carousel-list .container');
  const slidesButtons = block.querySelector('.carousel-list .owl-dots');
  const currentIndex = getCurrentSlideIndex(slidesContainer);
  slidesContainer.children[currentIndex].removeAttribute('active');
  slidesContainer.children[nextIndex].setAttribute('active', true);
  slidesButtons.children[currentIndex].classList.remove('active');
  slidesButtons.children[nextIndex].classList.add('active');
  slidesContainer.style.transform = `translateX(-${nextIndex * 100}%)`;
}

/**
 * Start auto scroll
 *
 * @param {Element} block
 * @param {number} interval
 */
function startAutoScroll(block, interval = DEFAULT_SCROLL_INTERVAL_MS) {
  scrollInterval = setInterval(() => {
    const currentIndex = getCurrentSlideIndex(block);
    switchSlide((currentIndex + 1) % numCarouselItems, block);
  }, interval);
}

/**
 * Stop auto-scroll animation
 *
 */
function stopAutoScroll() {
  clearInterval(scrollInterval);
  scrollInterval = undefined;
}

export default async function decorate(block) {
  // get config values
  const config = readBlockConfig(block);
  numCarouselItems = parseInt(config['carousel-items'], 10);
  numBlogItems = parseInt(config['list-items'], 10);
  block.innerHTML = '';
  if (numCarouselItems > numBlogItems) {
    // eslint-disable-next-line no-console
    console.error('number of carousel items should be less or equal to number of blogs in the list');
    return;
  }
  // build grid and carousel containers
  const carouselContainer = document.createElement('div');
  const blogsGridContainer = document.createElement('div');
  const carouselButtons = document.createElement('div');
  let dataKey = 'articles';
  carouselContainer.classList.add('carousel-list');
  carouselContainer.innerHTML = '<div class="container"></div>';
  blogsGridContainer.classList.add('blogs-grid-list');
  carouselButtons.classList.add('owl-dots');

  // get blog items
  if (category === '') {
    dataKey = 'gridList';
  }
  const articles = await getData(dataKey, loadOffset, numBlogItems);
  articles.forEach((blog, index) => {
    if (index < numCarouselItems) {
      const buttonElement = document.createElement('button');
      buildBlogItem(carouselContainer.querySelector('.container'), blog, true);
      buttonElement.classList.add('owl-dot');
      buttonElement.ariaLabel = `carousel-slide-${index}`;
      buttonElement.innerHTML = '<span/>';
      // switch carousel items on click
      buttonElement.addEventListener('click', () => {
        switchSlide((index) % numCarouselItems, block);
        stopAutoScroll();
      });
      carouselButtons.appendChild(buttonElement);
    }
    buildBlogItem(blogsGridContainer, blog);
  });
  carouselButtons.querySelectorAll('.owl-dot')[0].classList.add('active');
  carouselContainer.append(carouselButtons);
  carouselContainer.querySelector('.container').children[0].setAttribute('active', true);
  // add logic for load more button
  block.append(carouselContainer, blogsGridContainer);

  block.addEventListener('startAutoScroll', () => {
    startAutoScroll(block);
  });
  buildSeeMoreContentButton(block, dataKey);
  block.dispatchEvent(event);
}
