function getBlogDetailsPath() {
  const url = window.location.pathname;
  const startIndex = url.indexOf('/blog/blog-detail/') + '/blog/blog-detail/'.length;
  return url.substring(startIndex);
}

function buildApiPath() {
  return `/blog/blog-detail/jcr:content/${getBlogDetailsPath()}.json`;
}

function buildImageUrl(path) {
  return `${path}`;
}

/**
 * Returns background color by block category name
 *
 * @param {string} category
 * @returns {string}
 */
function buildCategoryUrl(category) {
  const host = window.location.origin;
  const path = '/blog/';
  return host + path + category.toLocaleLowerCase().replace(/\s+/g, '-');
}

async function getData() {
  const url = buildApiPath();
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
  }
  return data;
}

function prepareLink(path) {
  return path.replace(/\.html$/, '');
}

function selectCategoryInMenu(category) {
  const selector = `a[title="${category}"]`;
  document.querySelector(selector).parentNode.classList.add('selected-cat');
}

export default async function decorate(block) {
  const {
    title, description, image, mobileImage, tabletImage, publisheddate, category,
    previousarticle, previousarticlelink, relatedarticles, nextarticle, nextarticlelink,
  } = await getData();

  const blogNav = document.querySelector('.blog-nav');
  let html;
  blogNav.classList.add(category.toLowerCase().replace(/\s+/g, '-'));
  selectCategoryInMenu(category);
  html = `
    <div class="title-section">
        <p id="main-title" role="heading" aria-level="1" class="title">${title}</p>
    </div>
    <div class="content">
        <div class="left-section">
            <div class="image">
                <picture>
                    <source media="(max-width:900px)" srcset=${buildImageUrl(mobileImage)}>
                    <source media="(min-width:901px) and (max-width:1200px)" srcset=${buildImageUrl(tabletImage)}>
                    <img src=${buildImageUrl(image)} alt="article image">
                </picture>
            </div>
            <div class="description">
                ${description}
            </div>
        </div>
        <div class="right-section">
            <button type="button" class="share-page">
                <img src="/icons/ico-share.svg" alt="share-icon" width="23" height="20">
                <span class="share-this-page text-up">Share This Page</span></button>
            <div>
                <span>Published:</span>
                <span>${new Date(publisheddate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div>
                <span>Category:</span>
                <span><a href=${buildCategoryUrl(category)}>${category}</a></span>
            </div>
            <div class="related-articles">
                <p class="text-up">Related Articles:</p>
                <div>
                    <ul>${relatedarticles}</ul>
                </div>
            </div>
        </div>
        <div class="article-share-page">
            <div class="close-icon">✖</div>
            <div class="container">
                <h3>Share This Page</h3>
                <p class="article-share-page__description">Share this page on your social media platforms.</p>
                <ul class="article-share-page-icons">
                    <li class="araticle-share-page__item article-share-page__item--twitter">
                        <a href="https://twitter.com/share?text=${title}&amp;url=${window.location.href}"
                           data-text=${title}
                           data-url="${window.location.href}"
                           data-lang="en" data-show-count="false" target="_blank"
                           aria-label="twitter-icon" class=" twitter"></a>
                    </li>
                    <li data-href="${window.location.href}"
                        data-layout="button_count" data-size="small" data-keyboard="false" data-backdrop="static"
                        class="article-share-page__item article-share-page__item--facebook">
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${window.location.href}"
                           target="_blank" aria-label="facebook-icon" class="facebook"></a>
                    </li>
                    <li class="article-share-page__item article-share-page__item--linkedin">
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}"
                           rel="noopener" target="_blank" aria-label="linkedin-icon" class="linkedin"></a>
                    </li>
                </ul>
                <button class="button secondary close-button">
                    <span class="text-up">cancel</span></button>
            </div>
        </div>
    </div>`;
  if (nextarticle) {
    html += `<div class="next-article align-evenly">
            <div>
              <img src="/icons/preview-arrow.svg" alt="previous-article" width="17" height="7">
                <a href=${prepareLink(previousarticlelink)}
                  aria-label="previous-article-${previousarticle}"
                  class="text-up">${previousarticle}</a>
            </div>
            <div>
              <a href=${prepareLink(nextarticlelink)}
                aria-label="previous-article-${nextarticle}"
                class="text-up">${nextarticle}</a>
                <img src="/icons/preview-arrow.svg" alt="previous-article" width="17" height="7">
          </div>
    </div>
 `;
  } else {
    html += `<div class="next-article">
            <img src="/icons/preview-arrow.svg" alt="previous-article"  width="17" height="7">
            <a href=${prepareLink(previousarticlelink)}
               aria-label="previous-article-${previousarticle}"
               class="text-up">${previousarticle}</a>
    </div>`;
  }
  block.innerHTML = html;
  const shareBlogContainer = block.querySelector('.article-share-page');

  block.querySelector('.share-page').addEventListener('click', () => {
    shareBlogContainer.style.visibility = 'visible';
    shareBlogContainer.classList.add('slide');
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });

  block.querySelector('.close-icon').addEventListener('click', () => {
    shareBlogContainer.style.visibility = 'hidden';
  });

  block.querySelector('.close-button').addEventListener('click', () => {
    shareBlogContainer.style.visibility = 'hidden';
  });
}
