/* global google */

import { render as renderCards } from '../shared/property/cards.js';
import { button, div } from '../../scripts/dom-helpers.js';
import loadMaps from '../../scripts/google-maps/index.js';
import { loadScript, getMetadata } from '../../scripts/aem.js';

const cardView = button({ class: 'card-view' }, 'Grid View');
const mapView = button({ class: 'map-view' }, 'Map View');
const viewToggle = div({ class: 'view-toggle' });
const map = div({ class: 'gmap-canvas' });
const agentId = getMetadata('id');
let centerlat;
let centerlong;
let data;

function initMap(block, properties) {
  const ele = block.querySelector('.gmap-canvas');
  const gmap = new google.maps.Map(ele, {
    zoom: 9, // Set an appropriate zoom level
    center: { lat: centerlat, lng: centerlong }, // Set a default center
    mapTypeId: google.maps.MapTypeId?.ROADMAP,
    clickableIcons: false,
    gestureHandling: 'cooperative',
    visualRefresh: true,
    disableDefaultUI: true,
  });

  const createMarker = (property, amap) => new google.maps.Marker({
    position: { lat: parseFloat(property.Latitude), lng: parseFloat(property.Longitude) },
    map: amap,
    title: property.StreetName,
  });

  properties.forEach((property) => {
    createMarker(property, gmap);
  });
}

export default async function decorate(block) {
  const list = document.createElement('div');
  list.classList.add('property-list-cards', 'rows-1');
  viewToggle.append(cardView, mapView);
  block.append(viewToggle, list, map);

  try {
    const response = await fetch(`/bin/bhhs/agentPropertyListingsServlet.${agentId}.json`);
    data = await response.json();
    if (data) {
      const [firstProperty] = data.listings.properties;
      const { Latitude: latitude, Longitude: longitude } = firstProperty;
      centerlat = parseFloat(latitude);
      centerlong = parseFloat(longitude);
      renderCards(list, data.listings.properties);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching agent properties', error);
  }

  document.querySelector('.card-view').addEventListener('click', () => {
    document.querySelector('.property-list-cards').style.display = 'grid';
    document.querySelector('.card-view').style.display = 'none';
    document.querySelector('.map-view').style.display = 'block';
    document.querySelector('.gmap-canvas').classList.remove('active');
  });

  document.querySelector('.map-view').addEventListener('click', async () => {
    document.querySelector('.gmap-canvas').classList.add('active');
    document.querySelector('.map-view').style.display = 'none';
    document.querySelector('.card-view').style.display = 'block';
    document.querySelector('.property-list-cards').style.display = 'none';
    loadMaps();
    await google.maps.importLibrary('core');
    await google.maps.importLibrary('maps');
    await google.maps.importLibrary('marker');
    await loadScript('https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js', { type: 'application/javascript' });
    await loadScript('https://unpkg.com/jsts/dist/jsts.min.js', { type: 'application/javascript' });
    initMap(block, data.listings.properties);
  });
}
