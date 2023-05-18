function observeButtons() {
  const script = document.createElement('script');
  script.id = crypto.randomUUID();
  script.type = 'text/partytown';
  script.innerHTML = `
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '${window.hlx.codeBasePath}/blocks/property-search-bar/filters/additional-filter-buttons-delayed.js';
    document.head.append(script);
  `;
  document.head.append(script);
}

function build() {
  const buttons = ['cancel', 'reset'];
  const wrapper = document.createElement('div');
  wrapper.classList.add('filter-buttons', 'button-container', 'flex-row', 'vertical-center', 'hide');
  let output = `
    <a title="apply" rel="noopener" target="_blank" tabindex="" class="btn btn-primary center" role="button">
      <span class="text-up btn-primary c-w">apply</span>
    </a>`;
  buttons.forEach((button) => {
    output += `
      <a title="${button}" rel="noopener" target="_blank" tabindex="" class="btn btn-secondary center" role="button">
        <span class="text-up">${button}</span>
      </a>`;
  });
  wrapper.innerHTML = output;
  observeButtons();
  return wrapper;
}

const layoutButtons = {
  build,
};

export default layoutButtons;
