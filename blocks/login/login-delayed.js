import { close, displayError, reset } from './login.js';
import { login } from '../../scripts/apis/user.js';
import { i18nLookup } from '../../scripts/util.js';

const i18n = await i18nLookup();
const block = document.querySelector('.login.block');

function isValid(form) {
  const errors = [];
  const user = form.querySelector('input[name="username"]');
  if (!user.value || user.value.trim().length === 0) {
    errors.push(i18n('Email address is required.'));
    block.querySelector('input[name="username"]').classList.add('error');
  }

  const password = form.querySelector('input[name="password"]');
  if (!password.value || password.value.trim().length === 0) {
    block.querySelector('input[name="password"]').classList.add('error');
    errors.push(i18n('Password is required.'));
  }

  if (errors.length > 0) {
    displayError(errors);
    return false;
  }
  return true;
}

async function loginError(response) {
  if (response.status) {
    if (response.status === 401) {
      displayError([i18n('Invalid username or password.')]);
    } else {
      displayError([`${i18n('There was an error logging in')}: (${i18n(await response.text())})`]);
    }
  } else {
    displayError([`${i18n('There was an error logging in')}: ${i18n(response)}`]);
  }
}

/**
 * Submits the form.
 *
 * @param {HTMLFormElement} form
 */
async function submit(form) {
  reset();

  if (isValid(form)) {
    const credentials = {
      username: form.querySelector('input[name="username"]').value,
      password: form.querySelector('input[name="password"]').value,
    };
    const userDetails = await login(credentials, loginError);
    if (userDetails) {
      close();
    }
  }
}

[...block.querySelectorAll('input[name="username"], input[name="password"]')].forEach((el) => {
  el.addEventListener('blur', (e) => {
    const { value } = e.currentTarget;
    if (!value || value.trim().length === 0) {
      e.currentTarget.classList.add('error');
    } else {
      e.currentTarget.classList.remove('error');
    }
  });
});

const rememberMe = block.querySelector('.help .remember input[type="checkbox"]');
const pseudoRemember = block.querySelector('.remember .checkbox');
const warning = block.querySelector('.help .warning');

pseudoRemember.addEventListener('click', () => {
  rememberMe.click();
});

rememberMe.addEventListener('change', () => {
  pseudoRemember.classList.toggle('checked');
  warning.classList.toggle('visible');
});

block.querySelector('a.forgot-password').addEventListener('click', (e) => {
  e.currentTarget.closest('.login-form').classList.remove('open');
  const event = new Event('open-overlay');
  event.overlay = 'forgot-password'; // TODO: Change this to a constant exported from block.
  document.body.dispatchEvent(event);
});

block.querySelector('.create-account .create-button').addEventListener('click', (e) => {
  e.currentTarget.closest('.login-form').classList.remove('open');
  const event = new Event('open-overlay');
  event.overlay = 'create-account'; // TODO: Change this to a constant exported from block.
  document.body.dispatchEvent(event);
});

block.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
});

block.querySelector('.cta a.submit').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  submit(block.querySelector('form'));
});

block.querySelector('.cta a.cancel').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  close();
});
