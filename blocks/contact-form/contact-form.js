import { loadScript } from '../../scripts/aem.js';
import { removeSideModal, i18nLookup, getCookieValue } from '../../scripts/util.js';

const LOGIN_ERROR = 'There was a problem processing your request.';
const i18n = await i18nLookup();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[ (]?\d{3}[)]?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// Load reCaptcha script used on all forms.
loadScript('/blocks/contact-form/forms/callback.js');

/**
 * Adds form and cookie values to payload.
 *
 * @param {FormData} form - The FormData object representing the form data.
 */
function addFranchiseData(form) {
  // Common form elements
  const firstName = form.elements.first_name.value;
  const lastName = form.elements.last_name.value;
  const email = form.elements.email.value;
  const phone = form.elements.phone.value;
  const comments = form.elements.comments.value;

  // All forms except team inquiry
  if (form.id !== 'team-inquiry') {
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
    // Data format to JSON
    return JSON.stringify(jsonObj);
  }

  // Remaining Team Inquiry form elements
  const title = form.elements.title.value;
  const zip = form.elements.postalCode.value;
  const country = form.elements.country.value;
  const state = form.elements.state.value;
  const city = form.elements.city.value;
  const address1 = form.elements.addressOne.value;
  const address2 = form.elements.addressTwo.value;
  const numAgents = form.elements.numOfAgents.value;
  const gci = form.elements.gci.value;

  const formData = new FormData();
  formData.append('FirstName', firstName);
  formData.append('LastName', lastName);
  formData.append('Phone', phone);
  formData.append('Email', email);
  formData.append('Title', title);
  formData.append('Message', comments);
  formData.append('ZipCode', zip);
  formData.append('Country', country);
  formData.append('State', state);
  formData.append('City', city);
  formData.append('AddressOne', address1);
  formData.append('AddressTwo', address2);
  formData.append('NumOfAgents', numAgents);
  formData.append('GCI', gci);
  formData.append('Subject', 'Join our Team Website Inquiry');
  formData.append('SendEmail', true);
  formData.append('To', 'marketing@commonmoves.com');
  // Data format to URL Params
  return new URLSearchParams(formData).toString();
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

async function validateFormInputs(form) {
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

  if (form.id === 'team-inquiry') {
    const numAgentsEl = form.querySelector('input[name="numOfAgents"]');
    if (!numAgentsEl.value || numAgentsEl.value.trim().length === 0) {
      errors.push(i18n('Number of agents is required.'));
      numAgentsEl.classList.add('error');
    }
    const cgiEl = form.querySelector('input[name="CGI"]');
    if (!cgiEl.value || cgiEl.value.trim().length === 0) {
      errors.push(i18n('CGI in USD is required.'));
      cgiEl.classList.add('error');
    }
  }

  /* eslint-disable no-undef */
  if (!errors.length) {
    if (recaptchaToken) {
      const payload = `user_response=${encodeURIComponent(recaptchaToken)}`;
      const options = {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      };
      const url = '/bin/bhhs/googleRecaptchaServlet';
      await fetch(url, options)
        .then((data) => {
          // Handle the response based on the success property
          if (!data.ok) {
            errors.push(i18n('Captcha verification is required.'));
          }
        })
        .catch(() => {
          errors.push(i18n('Captcha verification failed.'));
        });
    } else {
      errors.push(i18n('Captcha verification is required.'));
    }
  }

  if (errors.length > 0) {
    displayError(errors);
    return false;
  }
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
      e.preventDefault();
      oldSubmit(this)
        .then((result) => {
          if (result) {
            const jsonData = addFranchiseData(this);
            const headers = new Headers();
            if (this.id === 'team-inquiry') {
              headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            } else {
              headers.append('Content-Type', 'application/json; charset=UTF-8');
            }
            const { action, method } = this;
            fetch(action, {
              method,
              headers,
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
                    removeSideModal();
                  });
                  sideModal?.replaceChildren(thankYou);
                } else {
                  block.replaceChildren(thankYou);
                  block.parentNode.nextSibling.remove();
                }
                if (window.grecaptcha) {
                  recaptchaToken = null;
                }
              }
            });
          }
        });
      return false;
    };
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const script of [...block.querySelectorAll('script')]) {
    let waitForLoad = Promise.resolve();
    // the script element added by innerHTML is NOT executed
    // the workaround is to create the new script tag, copy attibutes and content
    const newScript = document.createElement('script');

    newScript.setAttribute('type', 'text/javascript');
    // coping all script attribute to the new one
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

  block.style.display = displayValue;

  const cancelBtn = block.querySelector('.contact-form.block .cta button.cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeSideModal();
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

  if (window.grecaptcha) {
    recaptchaToken = null;
    renderRecaptcha();
  } else {
    loadScript('https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit', { async: true, defer: true });
  }
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
  await observer.observe(block);
}
