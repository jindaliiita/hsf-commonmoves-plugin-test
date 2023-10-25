import { readBlockConfig } from '../../scripts/aem.js';

function loadEmbeds() {
  const style = document.createElement('link');
  style.href = 'https://assets.juicer.io/embed.css';
  style.media = 'all';
  style.rel = 'stylesheet';
  style.type = 'text/css';

  document.head.append(style);

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://assets.juicer.io/embed.js';
  script.async = true;
  script.defer = true;
  document.head.append(script);
}

const io = new IntersectionObserver((categories) => {
  const sect = categories[0];
  if (sect.isIntersecting) {
    io.disconnect();
    loadEmbeds();
  }
});

export default async function decorate(block) {
  const config = readBlockConfig(block);

  block.innerHTML = `
    <h2>${config.title}</h2>
    <ul class="juicer-feed" 
      data-feed-id="${config['feed-id']}"
      data-pages="1"
      data-per="${config.show || ''}"
      data-columns="${config.columns || 4}"></ul>
  `;
  io.observe(block);
}
