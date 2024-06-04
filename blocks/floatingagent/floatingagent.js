import {
  getMetadata,
} from '../../scripts/aem.js';
import {
  button,
  div,
  h2,
  img,
  p,
  strong,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const agentName = getMetadata('name');
  const agentDesc = getMetadata('desc');
  const pic = getMetadata('pic');
  const lic = getMetadata('lic');

  const agentPicture = document.createElement('picture');
  agentPicture.appendChild(img({
    loading: 'lazy',
    alt: 'Agent Image',
    src: pic,
    width: '48',
    height: '64',
    style: 'width: 48px; height: 64px;',
  }));

  const agentInfo = div({ class: 'agentinfo' },
    h2(strong(agentName)),
    p(agentDesc),
    p(lic),
  );

  const contactButton = button({ class: 'contactagent' }, 'CONTACT AGENT');

  block.append(
    div({ class: 'floating-agent-col' }, agentPicture),
    agentInfo,
    contactButton,
  );
}

const displayedElement = document.querySelector('.floatingagent');

const heroElement = document.querySelector('.hero-wrapper');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      displayedElement.style.display = 'none';
    } else {
      displayedElement.style.display = 'flex';
    }
  });
}, {
  threshold: [0],
});

observer.observe(heroElement);
