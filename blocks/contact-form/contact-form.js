// eslint-disable no-console
const addForm = async (block) => {
  const displayValue = block.style.display;
  block.style.display = 'none';

  const formName = block.firstElementChild.innerText.trim();
  const thankYou = block.firstElementChild.nextElementSibling;
  const data = await fetch(`${window.hlx.codeBasePath}/blocks/contact-form/forms/${formName}.html`);
  if (!data.ok) {
    /* eslint-disable-next-line no-console */
    console.error(`failed to load form: ${formName}`);
    block.innerHTML = '';
    return;
  }

  block.innerHTML = await data.text();
  block.style.display = displayValue;
};

export default async function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      addForm(block);
    }
  }, {
    rootMargin: '300px',
  });
  observer.observe(block);
}
