import { hideSideModal, i18nLookup, getCookieValue } from '../../scripts/util.js';

const LOGIN_ERROR = 'There was a problem processing your request.';
const i18n = await i18nLookup();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[ (]?\d{3}[)]?[-.\s]?\d{3}[-.\s]?\d{4}$/;

/**
 * Adds customID and recipientID cookie values to the request body based on the form name.
 *
 * @param {FormData} form - The FormData object representing the form data.
 */
function addFranchiseData(form) {
  console.log('add data to form');
  const formName = form.body.id;
  const customID = getCookieValue('customerID');

  form.append('customID', customID);
  if (formName === 'contactForm') {
    form.append('recipientId', 'https://ma312.bhhs.hsfaffiliates.com/profile/card#me');
    form.append('recipientName', 'Commonwealth Real Estate');
    form.append('recipientType', 'organization');
    form.append('text', `Name: ${form.get('first_name')} ${form.get('last_name')}\n
    Email: ${form.get('email')}\n
    Phone: ${form.get('phone')}\n\n
    ${form.get('comments')}`);
  }
  if (formName === 'makeOffer') {
    form.append('recipientID', 'recipientID');
  }
}

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

function validateFormInputs(form) {
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
    errors.push(i18n('Phone number is required.'));
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
  console.log('validation passed');
  return true;
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

  const form = block.querySelector('form#contactForm');

  if (thankYou) {
    const oldSubmit = form.onsubmit;
    thankYou.classList.add('form-thank-you');
    form.onsubmit = function handleSubmit() {
      console.log('Handle submit'); // Check if this log appears
      if (oldSubmit.call(this)) {
        console.log('Form submitted'); // Check if this log appears
        const body = new FormData(this);
        addFranchiseData(body);
        const { action, method } = this;
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

  const inputs = block.querySelectorAll('input');
  inputs.forEach((formEl) => {
    formEl.placeholder = i18n(formEl.placeholder);
    formEl.ariaLabel = i18n(formEl.ariaLabel);
  });

  const taEl = block.querySelector('textarea');
  if (taEl && taEl.placeholder) taEl.placeholder = i18n(taEl.placeholder);

  block.style.display = displayValue;

  const submitBtn = block.querySelector('.contact-form.block .cta a.submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      console.log('button clicked');
      e.preventDefault();
      e.stopPropagation();
      if (validateFormInputs(form)) {
        form.submit();
      }
    });
  }

  const cancelBtn = block.querySelector('.contact-form.block .cta a.cancel');
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
      // create input mask
      el.addEventListener('input', (e) => {
        const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? `-${x[3]}` : ''}`;
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
