import { getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const id = getMetadata('liveby-id');
  const ref = getMetadata('liveby-ref');
  const community = getMetadata('liveby-community').toLowerCase();

  const resp = await fetch(`https://api.liveby.com/v1/pages?id=${id}&ref=/${ref}/communities/${community}`);

  if (resp.ok) {
    const data = await resp.json();
    /* eslint-disable-next-line no-underscore-dangle */
    block.setAttribute('data-liveby-community-id', data.boundary._id);
  } else {
    /* eslint-disable-next-line no-console */
    console.log('Unable to retrieve LiveBy Community information.');
  }
}
