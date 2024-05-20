let queryIndex;
export async function getQueryIndex() {
  if (!queryIndex) {
    const resp = await fetch('/communities/query-index.json');
    if (resp.ok) {
      queryIndex = await resp.json();
    }
  }
  return queryIndex;
}

export default async function decorate(block) {
  const index = await getQueryIndex();

  const list = document.createElement('div');
  list.classList.add('cards-list');
  index.data.forEach((community) => {
    const communityName = community['liveby-community'];

    const card = document.createElement('div');
    card.classList.add('cards-item');
    list.append(card);

    const cardBody = document.createElement('div');
    cardBody.classList.add('cards-item-body');
    card.append(cardBody);

    cardBody.onclick = () => {
      document.location.href = community.path;
    };

    // Add a listener to cardBody so that when it is active in the viewport,
    // the background image is set
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cardBody.style.backgroundImage = `url(${community.image})`;
          observer.unobserve(cardBody);
        }
      });
    });
    observer.observe(cardBody);

    const paragraphElement = document.createElement(('h4'));
    paragraphElement.textContent = `Explore ${communityName}`;
    cardBody.append(paragraphElement);
  });
  block.classList.add('cards');
  block.append(list);
}
