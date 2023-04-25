import homes from './home.js';
import agents from './agent.js';

/**
 * Builds the search forms for the Hero.
 */
export default async function buildSearch(types) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('search');
  const tabs = document.createElement('ul');
  tabs.classList.add('options');
  wrapper.append(tabs);

  for (let i = 0; i < types.length; i += 1) {
    const type = types[i];
    const item = document.createElement('li');
    item.classList.add('option');
    let form;
    if (type.toLowerCase() === 'homes') {
      // eslint-disable-next-line no-await-in-loop
      form = await homes.buildForm();
    } else if (type.toLowerCase() === 'agents') {
      form = agents.buildForm();
    }

    if (form) {
      item.textContent = type;
      item.setAttribute('data-option', type.toLowerCase());
      tabs.append(item);
      form.setAttribute('data-option', type.toLowerCase());
      wrapper.append(form);
    }
  }
  const active = wrapper.querySelector('.search .options .option');
  active.classList.add('active');
  wrapper.querySelector(`form[data-option="${active.getAttribute('data-option')}"]`).classList.add('active');

  wrapper.querySelectorAll('.search .options .option').forEach((option) => {
    option.addEventListener('click', () => {
      if (option.classList.contains('active')) {
        return;
      }
      const selected = option.getAttribute('data-option');
      option.parentElement.querySelector('.active').classList.remove('active');
      option.classList.add('active');
      wrapper.querySelector('form.active').classList.remove('active');
      wrapper.querySelector(`form.${selected}`).classList.add('active');
    });
  });

  return wrapper;
}
