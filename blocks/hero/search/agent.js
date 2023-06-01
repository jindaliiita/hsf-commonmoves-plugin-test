import { buildSearchBar } from '../../agent-search/builders/form.js';
import { buildSelectionTags } from '../../agent-search/builders/tags.js';

const formSubmitted = (urlParams) => {
  // Don't want to submit the keyword input.
  const form = document.querySelector('form.agents.agent-search');
  window.location.href = `${form.action}?${urlParams.toString()}`;
};

function buildForm() {
  const form = document.createElement('form');
  form.classList.add('agents', 'agent-search');
  form.setAttribute('action', '/search/agent');

  form.append(buildSearchBar(formSubmitted));
  form.append(buildSelectionTags());
  return form;
}

const agents = {
  buildForm,
};

export default agents;
