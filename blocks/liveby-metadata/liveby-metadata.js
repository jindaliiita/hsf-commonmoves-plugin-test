import { getMetadata } from '../../scripts/lib-franklin.js';

async function getCommunityId(id, ref, name) {
  const resp = await fetch(`https://api.liveby.com/v1/pages?id=${id}&ref=/${ref}/communities/${name}`);
  if (resp.ok) {
    const data = await resp.json();
    /* eslint-disable-next-line no-underscore-dangle */
    return data.boundary._id;
  }
  /* eslint-disable-next-line no-console */
  console.log('Unable to retrieve LiveBy Community information.');
  return undefined;
}

async function getGeometry(id) {
  const resp = await fetch(`https://api.liveby.com/v1/neighborhood/${id}`);
  if (resp.ok) {
    const data = await resp.json();
    /* eslint-disable-next-line no-underscore-dangle */
    const { geometry } = data.data;
    geometry.bbox = data.data.properties.bbox;
    geometry.centroid = data.data.properties.centroid;
    return geometry;
  }
  /* eslint-disable-next-line no-console */
  console.log('Unable to retrieve LiveBy Community information.');
  return undefined;
}

export default async function decorate(block) {
  if (!window.liveby) {
    const liveby = {};

    const id = getMetadata('liveby-id');
    const ref = getMetadata('liveby-ref');
    liveby.communityName = getMetadata('liveby-community').toLowerCase();
    liveby.communityId = await getCommunityId(id, ref, liveby.communityName);
    if (liveby.communityId) {
      liveby.geometry = await getGeometry(liveby.communityId);
    }
    window.liveby = liveby;
    block.remove();
  }
}
