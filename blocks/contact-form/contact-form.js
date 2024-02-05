import { hideSideModal, i18nLookup } from '../../scripts/util.js';

const LOGIN_ERROR = 'There was a problem processing your request.';
const i18n = await i18nLookup();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

function displayError(errors) {
  const message = document.body.querySelector('.contact-form.block').querySelector('.message');
  const details = message.querySelector('.details');
  const spans = [];
  [LOGIN_ERROR, ...errors].forEach((m) => {
    const span = document.createElement('span');
    span.textContent = i18n(m);
    spans.push(span);
  });
  details.replaceChildren(...spans);
  message.classList.add('error');
}

function isValid(form) {
  const errors = [];
  const firstName = form.querySelector('input[name="first_name"]');
  if (!firstName.value || firstName.value.trim().length === 0) {
    errors.push(i18n('First name is required.'));
    firstName.classList.add('error');
  }

  const lastName = form.querySelector('input[name="last_name"]');
  if (!lastName.value || lastName.value.trim().length === 0) {
    errors.push(i18n('Last name is required.'));
    lastName.classList.add('error');
  }

  const email = form.querySelector('input[name="email"]');
  if (!email.value || email.value.trim().length === 0) {
    errors.push(i18n('Email address is required.'));
    email.classList.add('error');
  }
  if (!emailRegex.test(email.value)) {
    errors.push(i18n('Please enter an email address in the format: email@domain.com.'));
    email.classList.add('error');
  }

  const phone = form.querySelector('input[name="phone"]');
  if (!phone.value || phone.value.trim().length === 0) {
    errors.push(i18n('Email address is required.'));
    phone.classList.add('error');
  }
  if (!phoneRegex.test(phone.value)) {
    errors.push(i18n('Please enter a 10 digit phone number.'));
    phone.classList.add('error');
  }

  if (errors.length > 0) {
    displayError(errors);
    return false;
  }
  return true;
}

function submitContactForm(form) {
  console.log('submitted');
  return isValid(form);
}

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

  const submitBtn = block.querySelector('.cta a.submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitContactForm(block.querySelector('form'));
    });
  }

  const cancelBtn = block.querySelector('.cta a.cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideSideModal();
    });
  }

  [...block.querySelectorAll('input[name="first_name"], input[name="last_name"]')]
    .forEach((el) => {
      el.addEventListener('blur', (e) => {
        const { value } = e.currentTarget;
        if (!value || value.trim().length === 0) {
          e.currentTarget.classList.add('error');
        } else {
          e.currentTarget.classList.remove('error');
        }
      });
    });

  [...block.querySelectorAll('input[name="phone"]')]
    .forEach((el) => {
      el.addEventListener('blur', (e) => {
        const { value } = e.currentTarget;
        if (!value || value.trim().length === 0 || !phoneRegex.test(value)) {
          e.currentTarget.classList.add('error');
        } else {
          e.currentTarget.classList.remove('error');
        }
      });
    });

  [...block.querySelectorAll('input[name="email"]')]
    .forEach((el) => {
      el.addEventListener('blur', (e) => {
        const { value } = e.currentTarget;
        if (!value || value.trim().length === 0 || !emailRegex.test(value)) {
          e.currentTarget.classList.add('error');
        } else {
          e.currentTarget.classList.remove('error');
        }
      });
    });

  if (thankYou) {
    const form = block.querySelector('#contactForm');
    const oldSubmit = form.onsubmit;
    thankYou.classList.add('form-thank-you');
    form.onsubmit = function handleSubmit() {
      if (oldSubmit.call(form)) {
        const body = new FormData(form);
        const { action, method } = form;
        fetch(action, { method, body, redirect: 'manual' }).then((resp) => {
          /* eslint-disable-next-line no-console */
          if (!resp.ok) console.error(`Form submission failed: ${resp.status} / ${resp.statusText}`);
          const firstContent = thankYou.firstElementChild;
          if (firstContent.tagName === 'A') {
            // redirect to thank you page
            window.location.href = firstContent.href;
          } else {
            // show thank you content
            const btn = thankYou.querySelector('a');
            const sideModal = document.querySelector('.side-modal-form');
            if (btn && sideModal) {
              btn.setAttribute('href', '#');
              btn.addEventListener('click', (e) => {
                e.preventDefault();
                hideSideModal();
              });
              sideModal?.replaceChildren(thankYou);
            } else {
              block.replaceChildren(thankYou);
            }
          }
        });
      }
      return false;
    };
  }

  // If the form has it's own styles, add them.
  const styles = block.querySelectorAll('style');
  styles.forEach((styleSheet) => {
    document.head.appendChild(styleSheet);
  });

  // If the form has it's own scripts, load them one by one to maintain execution order.
  // eslint-disable-next-line no-restricted-syntax
  for (const script of [...block.querySelectorAll('script')]) {
    let waitForLoad = Promise.resolve();
    // The script element added by innerHTML is NOT executed.
    // The workaround is to create the new script tag, copy attibutes and content.
    const newScript = document.createElement('script');
    newScript.setAttribute('type', 'text/javascript');
    // Copy script attributes to the new element.
    script.getAttributeNames().forEach((attrName) => {
      const attrValue = script.getAttribute(attrName);
      newScript.setAttribute(attrName, attrValue);

      if (attrName === 'src') {
        waitForLoad = new Promise((resolve) => {
          newScript.addEventListener('load', resolve);
        });
      }
    });
    newScript.innerHTML = script.innerHTML;
    script.remove();
    document.body.append(newScript);

    // eslint-disable-next-line no-await-in-loop
    await waitForLoad;
  }

  const inputs = block.querySelectorAll('input');
  inputs.forEach((formEl) => {
    formEl.placeholder = i18n(formEl.placeholder);
    formEl.ariaLabel = i18n(formEl.ariaLabel);
  });

  const taEl = block.querySelector('textarea');
  if (taEl && taEl.placeholder) taEl.placeholder = i18n(taEl.placeholder);

  // Get all checkboxes with class 'checkbox'
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // Define a function declaration to handle the change event
  function handleChange() {
    // Store the clicked checkbox in a variable
    const clickedCheckbox = this;

    // Uncheck all checkboxes that are not the clicked checkbox
    checkboxes.forEach((cb) => {
      if (cb !== clickedCheckbox) {
        cb.checked = false;
      }
    });
  }

  // Add the change event listener to each checkbox using the function declaration
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', handleChange);
    checkbox.nextElementSibling.addEventListener('change', handleChange);
  });

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
