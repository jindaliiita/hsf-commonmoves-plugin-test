export default async function decorate(block) {
  [...block.children].forEach((child) => {
    child.firstElementChild.classList.add('row-content');
    const title = child.firstElementChild.firstElementChild;
    title.classList.add('row-title');
    child.prepend(title);
  });
}
