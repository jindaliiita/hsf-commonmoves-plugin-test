export default async function decorate(block) {
  block.replaceChildren(document.createElement('hr'));
}
