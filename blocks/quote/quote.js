import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  block.innerHTML = `
    <p class="quote">${config.quote}</p>
    <div class="attribution">
      <p class="author">${config.author}</p>
      <p class="position">${config.position}</p>
    </div>
  `;
}
