/* global google */

import { loadScript } from '../../scripts/aem.js';
import loadMaps from '../../scripts/google-maps/index.js';
import {
  a, div, img, p, span,
} from '../../scripts/dom-helpers.js';
import displayClusters from './map/clusters.js';
import { UPDATE_SEARCH_EVENT } from '../../scripts/apis/creg/search/Search.js';
import BoxSearch from '../../scripts/apis/creg/search/types/BoxSearch.js';
import {
  clearInfos,
  hideInfos,
  getMarkerClusterer,
  displayPins,
} from './map/pins.js';
import {
  startPolygon,
  addPolygonPoint,
  closePolygon,
  clearPolygon,
} from './map/drawing.js';
import PolygonSearch from '../../scripts/apis/creg/search/types/PolygonSearch.js';

const zoom = 10;
const maxZoom = 18;

let gmap;
let renderInProgress = false;

const mapMarkers = [];
let clusterer;
let boundsTimeout;

let drawingClickListener;
let polygon;

const MAP_STYLE = [{
  featureType: 'administrative',
  elementType: 'labels.text.fill',
  stylers: [{ color: '#444444' }],
}, {
  featureType: 'administrative.locality',
  elementType: 'labels.text.fill',
  stylers: [{ saturation: '-42' }, { lightness: '-53' }, { gamma: '2.98' }],
}, {
  featureType: 'administrative.neighborhood',
  elementType: 'labels.text.fill',
  stylers: [{ saturation: '1' }, { lightness: '31' }, { weight: '1' }],
}, {
  featureType: 'administrative.neighborhood',
  elementType: 'labels.text.stroke',
  stylers: [{ visibility: 'off' }],
}, {
  featureType: 'administrative.land_parcel',
  elementType: 'labels.text.fill',
  stylers: [{ lightness: '12' }],
}, {
  featureType: 'landscape',
  elementType: 'all',
  stylers: [{ saturation: '67' }],
}, {
  featureType: 'landscape.man_made',
  elementType: 'geometry.fill',
  stylers: [{ visibility: 'on' }, { color: '#ececec' }],
}, {
  featureType: 'landscape.natural',
  elementType: 'geometry.fill',
  stylers: [{ visibility: 'on' }],
}, {
  featureType: 'landscape.natural.landcover',
  elementType: 'geometry.fill',
  stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { saturation: '-2' }, { gamma: '7.94' }],
}, {
  featureType: 'landscape.natural.terrain',
  elementType: 'geometry',
  stylers: [{ visibility: 'on' }, { saturation: '94' }, { lightness: '-30' }, { gamma: '8.59' }, { weight: '5.38' }],
}, {
  featureType: 'poi',
  elementType: 'all',
  stylers: [{ visibility: 'off' }],
}, {
  featureType: 'poi.park',
  elementType: 'geometry',
  stylers: [{ saturation: '-26' }, { lightness: '20' }, { weight: '1' }, { gamma: '1' }],
}, {
  featureType: 'poi.park',
  elementType: 'geometry.fill',
  stylers: [{ visibility: 'on' }],
}, {
  featureType: 'road',
  elementType: 'all',
  stylers: [{ saturation: -100 }, { lightness: 45 }],
}, {
  featureType: 'road',
  elementType: 'geometry.fill',
  stylers: [{ visibility: 'on' }, { color: '#fafafa' }],
}, {
  featureType: 'road',
  elementType: 'geometry.stroke',
  stylers: [{ visibility: 'off' }],
}, {
  featureType: 'road',
  elementType: 'labels.text.fill',
  stylers: [{ gamma: '0.95' }, { lightness: '3' }],
}, {
  featureType: 'road',
  elementType: 'labels.text.stroke',
  stylers: [{ visibility: 'off' }],
}, {
  featureType: 'road.highway',
  elementType: 'all',
  stylers: [{ visibility: 'simplified' }],
}, {
  featureType: 'road.highway',
  elementType: 'geometry',
  stylers: [{ lightness: '100' }, { gamma: '5.22' }],
}, {
  featureType: 'road.highway',
  elementType: 'geometry.stroke',
  stylers: [{ visibility: 'on' }],
}, {
  featureType: 'road.arterial',
  elementType: 'labels.icon',
  stylers: [{ visibility: 'off' }],
}, {
  featureType: 'transit',
  elementType: 'all',
  stylers: [{ visibility: 'off' }],
}, {
  featureType: 'water',
  elementType: 'all',
  stylers: [{ color: '#b3dced' }, { visibility: 'on' }],
}, {
  featureType: 'water',
  elementType: 'labels.text.fill',
  stylers: [{ visibility: 'on' }, { color: '#ffffff' }],
}, {
  featureType: 'water',
  elementType: 'labels.text.stroke',
  stylers: [{ visibility: 'off' }, { color: '#e6e6e6' }],
}];

function decorateMap(parent) {
  /* @formatter:off */
  const controls = div({ class: 'map-controls-wrapper' },
    div({ class: 'custom-controls' },
      a({
        class: 'map-style',
        role: 'button',
        'aria-label': 'Satellite View',
      },
      img({ src: '/icons/globe.png' }),
      span({ class: 'satellite' }, 'Satellite'),
      span({ class: 'map' }, 'Map'),
      ),
      a({
        class: 'map-draw-complete disabled',
        role: 'button',
        'aria-label': 'Complete Draw',
      },
      img({ src: '/icons/checkmark.svg' }),
      span('Done')),
      a({
        class: 'map-draw',
        role: 'button',
        'aria-label': 'Draw',
      },
      img({ class: 'draw', src: '/icons/pencil.svg' }),
      img({ class: 'close', src: '/icons/close-x.svg' }),
      span({ class: 'draw' }, 'Draw'),
      span({ class: 'close' }, 'Close'),
      ),
      div({ class: 'zoom-controls' },
        a({ class: 'zoom-in', role: 'button', 'aria-label': 'Zoom In' }),
        a({ class: 'zoom-out', role: 'button', 'aria-label': 'Zoom Out' }),
      ),
    ),
  );
  const info = div({ class: 'map-draw-info' },
    p({ class: 'map-draw-tooltip' }, 'Click points on the map to draw your search.'),
    p({ class: 'map-draw-boundary-link' },
      a({ role: 'button', 'aria-label': 'Remove Map Boundary' }, 'Add Map Boundary'),
    ),
  );

  /* @formatter:on */
  parent.append(controls, info);
}

async function boundsChanged() {
  if (polygon) return;
  window.clearTimeout(boundsTimeout);
  boundsTimeout = window.setTimeout(() => {
    const bounds = gmap.getBounds();
    const search = new BoxSearch();
    search.populateFromURLSearchParameters(new URLSearchParams(window.location.search));
    search.maxLat = bounds.getNorthEast().lat();
    search.maxLon = bounds.getNorthEast().lng();
    search.minLat = bounds.getSouthWest().lat();
    search.minLon = bounds.getSouthWest().lng();
    window.dispatchEvent(new CustomEvent(UPDATE_SEARCH_EVENT, { detail: { search } }));
  }, 1000);
}

function doneDrawing() {
  polygon = closePolygon();
  drawingClickListener.remove();
  gmap.setOptions({ gestureHandling: 'cooperative' });
  document.querySelector('.property-search-results.block .search-map-container').classList.remove('drawing');
  const search = new PolygonSearch();
  search.populateFromURLSearchParameters(new URLSearchParams(window.location.search));
  polygon.getPath().forEach((latLng) => {
    search.addPoint({ lat: latLng.lat(), lon: latLng.lng() });
  });
  window.dispatchEvent(new CustomEvent(UPDATE_SEARCH_EVENT, { detail: { search } }));
}

function endDrawing() {
  clearPolygon();
  polygon = undefined;
  drawingClickListener.remove();
  gmap.setOptions({ gestureHandling: 'cooperative' });
  document.querySelector('.property-search-results.block .search-map-container').classList.remove('drawing');
  boundsChanged();
}

function drawingClickHandler(e) {
  if (addPolygonPoint(e.latLng)) {
    doneDrawing();
  }
}

function startDrawing() {
  gmap.setOptions({ gestureHandling: 'none' });
  drawingClickListener = gmap.addListener('click', drawingClickHandler);
  startPolygon(gmap);
}

function observeControls(block) {
  block.querySelector('.search-map-container a.map-draw').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const start = e.currentTarget.closest('.search-map-container').classList.toggle('drawing');
    if (start) {
      startDrawing(gmap);
    } else {
      endDrawing();
    }
  });

  block.querySelector('.search-map-container a.map-draw-complete').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    doneDrawing();
  });

  block.querySelector('.search-map-container a.map-style').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.closest('.search-map-container').classList.toggle('map');
    e.currentTarget.closest('.search-map-container').classList.toggle('satellite');
    const type = gmap.getMapTypeId();
    if (type === google.maps.MapTypeId.ROADMAP) {
      gmap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    } else {
      gmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
  });

  block.querySelector('.search-map-container a.zoom-in').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    gmap.setZoom(gmap.getZoom() + 1);
  });

  block.querySelector('.search-map-container a.zoom-out').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    gmap.setZoom(gmap.getZoom() - 1);
  });
}

function clearMarkers() {
  clearInfos();
  clusterer.clearMarkers();
  if (mapMarkers.length) {
    mapMarkers.forEach((marker) => {
      marker.setVisible(false);
      marker.setMap(null);
    });
  }
  mapMarkers.length = 0;
}

function getMarkerBounds(markers) {
  const bounds = new google.maps.LatLngBounds();
  markers.forEach((m) => {
    bounds.extend(m.getPosition());
  });
  return bounds;
}

/**
 * Updates the map view with the new results.
 * @param results
 */
async function displayResults(results) {
  renderInProgress = true;
  // Map isn't loaded yet.
  if (!gmap) {
    window.setTimeout(() => {
      displayResults(results);
    }, 1000);
    return;
  }

  // Map needs to be initialized.
  if (gmap.getRenderingType() === google.maps.RenderingType.UNINITIALIZED) {
    gmap.addListener('renderingtype_changed', () => {
      displayResults(results);
    });
    return;
  }
  // Clear any info windows
  // Clear any existing Markers.
  if (!results.properties || results.properties.length === 0) return;

  clearMarkers();

  if (results.clusters.length) {
    mapMarkers.push(...(await displayClusters(gmap, results.clusters)));
  } else if (results.pins.length) {
    mapMarkers.push(...(await displayPins(gmap, results.pins)));
    clusterer.addMarkers(mapMarkers);
  }

  const bounds = getMarkerBounds(mapMarkers);
  if (!gmap.getBounds().contains(bounds.getCenter())) {
    gmap.fitBounds(bounds);
  }
  renderInProgress = false;
}

/**
 * Reinitialize the Map based on history navigation.
 *
 * @param search the search that will be performed.
 */
function reinitMap(search) {
  clearMarkers();
  clearPolygon();
  if (search instanceof PolygonSearch) {
    startPolygon(gmap);
    search.points.forEach((point) => {
      const { lat, lon } = point;
      addPolygonPoint(new google.maps.LatLng({ lat: parseFloat(lat), lng: parseFloat(lon) }));
    });
    polygon = closePolygon();
  }
}

/**
 * Loads Google Maps and draws the initial view.
 * @param block
 * @return {Promise<void>}
 */
async function initMap(block, search) {
  const ele = block.querySelector('#gmap-canvas');

  gmap = new google.maps.Map(ele, {
    zoom,
    maxZoom,
    center: { lat: 41.24216, lng: -96.207990 },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    clickableIcons: false,
    gestureHandling: 'cooperative',
    styles: MAP_STYLE,
    visualRefresh: true,
    disableDefaultUI: true,
  });

  decorateMap(block.querySelector('.search-results-map'));
  block.querySelector('.search-map-wrapper').append(div({ class: 'mobile-info-window info-window' }));
  observeControls(block);

  gmap.addListener('click', () => {
    hideInfos();
  });

  // Don't use 'bounds_changed' event for updating results - fires too frequently.
  gmap.addListener('dragend', () => {
    hideInfos();
    boundsChanged();
  });
  gmap.addListener('dblclick', () => {
    hideInfos();
    boundsChanged();
  });

  gmap.addListener('zoom_changed', () => {
    if (renderInProgress) {
      return;
    }
    hideInfos();
    boundsChanged();
  });

  clusterer = getMarkerClusterer(gmap);
  if (search instanceof PolygonSearch) {
    startPolygon(gmap);
    search.points.forEach((point) => {
      const { lat, lon } = point;
      addPolygonPoint(new google.maps.LatLng({ lat: parseFloat(lat), lng: parseFloat(lon) }));
    });
    polygon = closePolygon();
  }
}

// Anytime a search is performed, hide any existing markers.
// window.addEventListener(EVENT_NAME, hideMarkers);

/* Load all the map libraries here */
loadMaps();
await google.maps.importLibrary('core');
await google.maps.importLibrary('maps');
await google.maps.importLibrary('marker');
await loadScript('https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js', { type: 'application/javascript' });
await loadScript('https://unpkg.com/jsts/dist/jsts.min.js', { type: 'application/javascript' });
export {
  displayResults,
  initMap,
  reinitMap,
};
