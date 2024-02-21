import { hideSideModal, i18nLookup, getCookieValue } from '../../scripts/util.js';

const LOGIN_ERROR = 'There was a problem processing your request.';
const i18n = await i18nLookup();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[ (]?\d{3}[)]?[-.\s]?\d{3}[-.\s]?\d{4}$/;

/**
 * Adds form and cookie values to a JSON object.
 *
 * @param {FormData} form - The FormData object representing the form data.
 */
function addFranchiseData(form) {
  const firstName = form.elements.first_name.value;
  const lastName = form.elements.last_name.value;
  const email = form.elements.email.value;
  const phone = form.elements.phone.value;
  const comments = form.elements.comments.value;
  const hasAgentRadio = form.elements.hasAgent;
  const hasAgentValue = Array.from(hasAgentRadio).find((radio) => radio.checked)?.value === 'yes';
  const officeIdMeta = document.querySelector('meta[name="office-id"]').getAttribute('content');
  const jsonObj = {};
  jsonObj.data = {};
  jsonObj.form = form.id;

  try {
    const consumerCookie = getCookieValue('consumerID');
    if (consumerCookie !== null) {
      jsonObj.data.consumerID = consumerCookie;
    } else {
      /* eslint-disable-next-line no-console */
      console.warn('Cookie not found: consumerID');
    }
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('Error getting cookie value:', error);
  }

  jsonObj.data.email = email;
  jsonObj.data.name = `${firstName} ${lastName}`;
  jsonObj.data.recipientId = `https://${officeIdMeta}.bhhs.hsfaffiliates.com/profile/card#me`;
  jsonObj.data.recipientName = 'Commonwealth Real Estate';
  jsonObj.data.recipientType = 'organization';
  jsonObj.data.source = `https://${officeIdMeta}.bhhs.hsfaffiliates.com/profile/card#me`;
  jsonObj.data.telephone = phone;
  jsonObj.data.text = `Name: ${firstName} ${lastName}\n
  Email: ${email}\n
  Phone: ${phone}\n\n
  ${comments}`;
  jsonObj.data.url = `${window.location.href} | ${document.title}`;
  jsonObj.data.workingWithAgent = hasAgentValue;
  if (form.id === 'property-contact') {
    jsonObj.data.addressLocality = 'Boston';
    jsonObj.data.addressRegion = 'Boston';
    jsonObj.data.agentType = 'Boston';
    jsonObj.data.coListing = 'Boston';
    jsonObj.data.postalCode = 'Boston';
    jsonObj.data.price = 'Boston';
    jsonObj.data.priceCurrency = 'Boston';
    jsonObj.data.streetAddress = 'Boston';
  }
  if (form.id === 'make-offer' || form.id === 'see-property') {
    jsonObj.listAor = 'mamlspin';
    jsonObj.mlsId = '234234';
    jsonObj.mlsKey = '234234';
    jsonObj.mlsName = 'MLSPIN - MLS Property Information Network';
    jsonObj.pid = '234234';
  }
  return JSON.stringify(jsonObj);
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

  const form = block.querySelector('form.contact-form');

  // if there is a thank you, highjack the submission
  // otherwise submit form normally.
  if (thankYou) {
    const oldSubmit = validateFormInputs;
    thankYou.classList.add('form-thank-you');
    form.onsubmit = function handleSubmit(e) {
      console.log('Handle submit'); // Check if this log appears
      e.preventDefault();
      if (oldSubmit(this)) {
        console.log('OnSubmit called'); // Check if this log appears
        const jsonData = addFranchiseData(this);
        const { action, method } = this;
        console.log('Call fetch'); // Check if this log appears
        fetch(action, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonData,
          credentials: 'include',
        }).then((resp) => {
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
              btn.addEventListener('click', (event) => {
                event.preventDefault();
                hideSideModal();
              });
              sideModal?.replaceChildren(thankYou);
            } else {
              block.replaceChildren(thankYou);
              block.parentNode.nextSibling.remove();
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

  const cancelBtn = block.querySelector('.contact-form.block .cta button.cancel');
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
        e.target.value = !x[2] ? x[1] : `${x[1]}-${x[2]}${x[3] ? `-${x[3]}` : ''}`;
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
