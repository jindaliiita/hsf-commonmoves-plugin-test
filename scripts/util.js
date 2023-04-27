/**
 * Creates the standard Spinner Div.
 *
 * @returns {HTMLDivElement} the spinner div.
 */
export function getSpinner() {
  const div = document.createElement('div');
  div.classList.add('loading-spinner');
  div.innerHTML = '<span></span>';
  return div;
}

/**
 * Creates and displays a modal with the specified text.
 * @param {Object|String} content the content to show.
 * @param {String} content.title the title to show
 * @param {String} content.body the body to show
 */
export function showModal(content) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <p></p>
      <p class="button-container">
        <a rel="noopener" href="" tabindex="">OK</a>
      </p>
    </div>
  `;

  modal.querySelector('.modal-content p').innerHTML = content.body ? content.body : content;

  if (content.title) {
    const h3 = document.createElement('h3');
    h3.textContent = content.title;
    modal.querySelector('.modal-content').prepend(h3);
  }

  modal.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.overflowY = null;
    modal.remove();
  });
  document.body.style.overflowY = 'hidden';
  document.body.append(modal);
}

const Util = {
  getSpinner,
  showModal,
};

export default Util;
