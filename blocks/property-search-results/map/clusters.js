/* global google */

import Search, { UPDATE_SEARCH_EVENT } from '../../../scripts/apis/creg/search/Search.js';
import { DRAWING_ENDED, DRAWING_STARTED } from './drawing.js';

let drawing = false;

const clusterClickHandler = async (map, cluster) => {
  if (drawing) return;
  const center = new google.maps.LatLng(cluster.centerLat, cluster.centerLon);
  map.panTo(center);
  const search = await Search.load('Box');
  search.populateFromURLSearchParameters(new URLSearchParams(window.location.search));
  search.minLat = cluster.swLat;
  search.minLon = cluster.swLon;
  search.maxLat = cluster.neLat;
  search.maxLon = cluster.neLon;
  window.dispatchEvent(new CustomEvent(UPDATE_SEARCH_EVENT, { detail: { search } }));
};

const compensateForCluster = (count) => {
  let increase = 0;
  const log = Math.log10(count);
  increase = 6 * (Math.round(log * 2) / 2);
  return increase;
};

/**
 * Create a cluster marker from a search result cluster.
 * @param {Object} cluster
 * @param {Number} cluster.centerLat Latitude center of the cluster
 * @param {Number} cluster.centerLon Longitude center of the cluster
 * @param {Number} cluster.count Number of properties in cluster.
 */
export function createClusterMaker(cluster) {
  // const dimensions = { width: 30, height: 30 };
  const sizeCompensation = compensateForCluster(cluster.count);
  const size = 30 + sizeCompensation;
  const icon = {
    url: '/icons/maps/map-clusterer-blue.png',
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };

  return new google.maps.Marker({
    position: new google.maps.LatLng(cluster.centerLat, cluster.centerLon),
    zIndex: cluster.count,
    icon,
    label: {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      text: `${cluster.count}`,
      color: 'white',
      className: 'no-class',
    },
  });
}

export default async function displayClusters(map, clusters) {
  map.getDiv().addEventListener(DRAWING_STARTED, () => { drawing = true; });
  map.getDiv().addEventListener(DRAWING_ENDED, () => { drawing = false; });

  const markers = [];
  clusters.forEach((cluster) => {
    const marker = createClusterMaker(cluster);
    marker.setMap(map);
    marker.addListener('click', () => {
      clusterClickHandler(marker.map, cluster);
    });
    markers.push(marker);
  });
  return markers;
}
