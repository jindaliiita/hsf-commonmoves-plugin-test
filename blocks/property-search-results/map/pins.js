/* global google */
/* global markerClusterer */

import { formatPrice } from '../../../scripts/util.js';
import { createClusterMaker } from './clusters.js';
import { BREAKPOINTS } from '../../../scripts/scripts.js';
import { getDetails } from '../../../scripts/apis/creg/creg.js';
import {
  a, p, div, img, span, domEl,
} from '../../../scripts/dom-helpers.js';
import { DRAWING_ENDED, DRAWING_STARTED } from './drawing.js';

let drawing;
let moTimeout;
let moController;

const infoWindows = [];

function createInfo(property) {
  const href = property.PdpPath.includes('www.commonmoves.com') ? `/property/detail/pid-${property.ListingId}` : property.PdpPath;
  const providers = [];
  if (property.propertyProviders || property.originatingSystemName) {
    providers.push('Listing Provided by: ');
    providers.push(property.propertyProviders || property.originatingSystemName);
  }

  const details = div({ class: 'details' },
    div({ class: 'address' },
      span({ class: 'street' }, property.StreetName || ''),
      span({ class: 'locality' }, `${`${property.City}, ` || ' '} ${`${property.StateOrProvince} ` || ' '} ${property.PostalCode || ''}`),
    ),
  );

  if (property.sellingOfficeName) {
    const address = details.querySelector('.address');
    address.prepend(
      span({ class: 'danger' }, `${property.mlsStatus || ''} ${property.ClosedDate || ''}`),
    );
  }

  if (property.municipality) {
    details.append(span({ class: 'municipality' }, property.municipality));
  }

  details.append(span({ class: 'providers' }, ...providers));

  const listing = div({ class: 'listing-info' });
  if (property.addMlsFlag === 'true') {
    listing.append(span({ class: 'mls' }, `MLS ID: ${property.ListingId}`));
  }
  if (property.CourtesyOf) {
    listing.append(span({ class: 'courtesy' }, `Listing courtesy of: ${property.CourtesyOf}`));
  }
  if (property.sellingOfficeName) {
    listing.append(span({ class: 'courtesy' }, `Listing sold by: ${property.sellingOfficeName}`));
  }
  if (property.addMlsFlag && property.listAor) {
    const aor = div({ class: 'aor' }, span(`Listing provided by: ${property.listAor}`));
    if (property.brImageUrl) {
      aor.append(span({ class: 'aor-img' }, img({ src: property.brImageUrl })));
    }
    listing.append(aor);
  }

  const image = div({ class: 'image-wrapper' },
    div({ class: 'luxury' }, span('Luxury Collection')),
    img({ src: property.smallPhotos[0]?.mediaUrl }),
  );
  const info = div({ class: 'info' },
    div({ class: 'price' },
      span({ class: 'us' }, property.ListPriceUS || ''),
      span({ class: 'alt' }, property.listPriceAlternateCurrency || ''),
    ),
    div({ class: 'property-buttons' },
      a({ class: 'contact-us', 'aria-label': `Contact us about ${property.StreetName}` },
        span({ class: 'icon icon-envelope' }, img({
          'data-icon-name': 'envelope',
          src: '/icons/envelope.svg',
          alt: 'envelope',
        })),
        span({ class: 'icon icon-envelopedark' }, img({
          'data-icon-name': 'envelopedark',
          src: '/icons/envelopedark.svg',
          alt: 'envelope',
        })),
      ),
      a({ class: 'save', 'aria-label': `Save ${property.StreetName}` },
        span({ class: 'icon icon-heartempty' }, img({
          'data-icon-name': 'heartempty',
          src: '/icons/heartempty.svg',
          alt: 'heart',
        })),
        span({ class: 'icon icon-heartemptydark' }, img({
          'data-icon-name': 'heartemptydark',
          src: '/icons/heartemptydark.svg',
          alt: 'heart',
        })),
        span({ class: 'icon icon-heartfull' }, img({
          'data-icon-name': 'heartfull',
          src: '/icons/heartfull.svg',
          alt: 'heart',
        })),
      ),
    ),
    details,
    domEl('hr'),
    listing,
  );

  return a({ class: 'info-wrapper', rel: 'noopener', href }, image, info);
}

/**
 * Removes all Info Windows that may be on the map or attached to markers.
 */
function clearInfos() {
  document.querySelector('.property-search-results.block .mobile-info-window').replaceChildren();
  infoWindows.forEach((iw) => {
    iw.close();
    iw.visible = false;
  });
  infoWindows.length = 0;
}

/**
 * Hides any visible Info Windows on the map.
 */
function hideInfos() {
  document.querySelector('.property-search-results.block .mobile-info-window').replaceChildren();
  infoWindows.forEach((iw) => {
    if (iw.visible) {
      iw.close();
      iw.visible = false;
    }
  });
}

async function clusterMouseHandler(marker, cluster) {
  moController?.abort();
  moController = new AbortController();
  const controller = moController;
  if (marker.infoWindow?.visible) {
    return;
  }
  hideInfos();
  if (!marker.infoWindow && !controller.signal.aborted) {
    const content = div({ class: 'info-window cluster' }, div({ class: 'loading' }, p('Loading...')));
    const tmp = new google.maps.InfoWindow({ content });
    tmp.open({ anchor: marker, shouldFocus: false });
    const center = marker.getMap().getCenter();
    // But if this fetch was canceled, don't show the info window.
    const ids = [];
    cluster.markers.forEach((m) => {
      ids.push(m.listingKey);
    });
    await getDetails(...ids).then((listings) => {
      // If we got this far, may as well add the content to info window.
      const infos = [];
      listings.forEach((property) => {
        infos.push(createInfo(property));
      });
      content.replaceChildren(...infos);
      const iw = new google.maps.InfoWindow({ content });
      iw.setContent(content);
      iw.addListener('close', () => marker.getMap().panTo(center));
      infoWindows.push(iw);
      marker.infoWindow = iw;
      tmp.close();
    });
  }
  if (controller.signal.aborted) {
    return;
  }
  marker.infoWindow.open({ anchor: marker, shouldFocus: false });
  marker.infoWindow.visible = true;
}

/**
 * Display the Mobile Info Window with the desired content.
 * @param {Promise<Array<HTMLElement>>} promise a promise that resolves to the content to display
 * @param cluster flag to indicate if this is a list of properties
 */
async function showMobileInfoWindow(promise, cluster = false) {
  window.scrollTo({ top: 115, behavior: 'smooth' });
  const iw = document.querySelector('.property-search-results.block .search-map-wrapper .mobile-info-window');
  if (cluster) iw.classList.add('cluster');
  iw.replaceChildren(div({ class: 'loading' }, p('Loading...')));
  promise.then((content) => {
    // eslint-disable-next-line no-param-reassign
    content = content.length ? content : [content];
    iw.replaceChildren(...content);
  });
}

/*
  See https://googlemaps.github.io/js-markerclusterer/interfaces/MarkerClustererOptions.html#renderer
 */
const ClusterRenderer = {
  render: (cluster) => {
    const marker = createClusterMaker({
      centerLat: cluster.position.lat(),
      centerLon: cluster.position.lng(),
      count: cluster.count,
    });

    // Do not fire the fetch immediately, give the user a beat to move their mouse to desired target.
    marker.addListener('mouseout', () => window.clearTimeout(moTimeout));
    marker.addListener('mouseover', () => {
      if (drawing) return;
      if (BREAKPOINTS.medium.matches) {
        moTimeout = window.setTimeout(() => clusterMouseHandler(marker, cluster), 500);
      }
    });
    return marker;
  },
};

function pinGroupClickHandler(e, cluster) {
  if (drawing) return;
  if (BREAKPOINTS.medium.matches && e.domEvent instanceof TouchEvent) {
    clusterMouseHandler(cluster.marker, cluster);
  } else {
    const listings = cluster.markers.map((m) => m.listingKey);
    const promise = getDetails(...listings).then((details) => {
      const links = [];
      details.forEach((property) => {
        links.push(createInfo(property));
      });
      return links;
    });
    showMobileInfoWindow(promise, true);
  }
}

/**
 * Generate a new Marker Clusterer from the map.
 * @param map
 * @return {markerClusterer.MarkerClusterer}
 */
function getMarkerClusterer(map) {
  return new markerClusterer.MarkerClusterer({ map, renderer: ClusterRenderer, onClusterClick: pinGroupClickHandler });
}

async function pinMouseHandler(marker, pin) {
  moController?.abort();
  moController = new AbortController();
  const controller = moController;
  if (marker.infoWindow?.visible) {
    return;
  }
  hideInfos();
  if (!marker.infoWindow && !controller.signal.aborted) {
    const content = div({ class: 'info-window' }, div({ class: 'loading' }, p('Loading...')));
    const tmp = new google.maps.InfoWindow({ content });
    tmp.open({ anchor: marker, shouldFocus: false });
    const center = marker.getMap().getCenter();
    // But if this fetch was canceled, don't show the info window.
    await getDetails(pin.listingKey).then((listings) => {
      content.replaceChildren(createInfo(listings[0]));
      const iw = new google.maps.InfoWindow({ content });
      iw.setContent(content);
      iw.addListener('close', () => marker.getMap().panTo(center));
      infoWindows.push(iw);
      marker.infoWindow = iw;
      tmp.close();
    });
  }
  if (controller.signal.aborted) {
    return;
  }
  marker.infoWindow.open({ anchor: marker, shouldFocus: false });
  marker.infoWindow.visible = true;
}

/**
 * Create a cluster marker from a search result cluster.
 * @param {Object} pin
 * @param {Number} pin.lat Latitude of the pin
 * @param {Number} pin.lon Longitude of the pin
 * @param {Number} pin.price Price of the pin listing
 * @param {Number} pin.listingKey Listing id of the pin
 * @param {Number} pin.officeCode Office code of the listing.
 */
function createPinMarker(pin) {
  const icon = {
    url: '/icons/maps/map-marker-standard.png',
    scaledSize: new google.maps.Size(50, 25),
    anchor: new google.maps.Point(25, 0),
  };

  const marker = new google.maps.Marker({
    position: new google.maps.LatLng(pin.lat, pin.lon),
    zIndex: 1,
    icon,
    label: {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      text: `$${formatPrice(pin.price)}`,
      color: 'white',
      className: 'no-class',
    },
  });
  marker.addListener('click', (e) => {
    if (drawing) return;
    if (BREAKPOINTS.medium.matches && e.domEvent instanceof TouchEvent) {
      pinMouseHandler(marker, pin);
    } else {
      showMobileInfoWindow(getDetails(pin.listingKey).then((details) => createInfo(details[0])));
    }
  });
  // Do not fire the fetch immediately, give the user a beat to move their mouse to desired target.
  marker.addListener('mouseout', () => window.clearTimeout(moTimeout));
  marker.addListener('mouseover', () => {
    if (drawing) return;
    if (BREAKPOINTS.medium.matches) {
      moTimeout = window.setTimeout(() => pinMouseHandler(marker, pin), 500);
    }
  });

  marker.listingKey = pin.listingKey;
  return marker;
}

async function displayPins(map, pins) {
  map.getDiv().addEventListener(DRAWING_STARTED, () => { drawing = true; });
  map.getDiv().addEventListener(DRAWING_ENDED, () => { drawing = false; });

  const markers = [];
  pins.forEach((pin) => {
    const marker = createPinMarker(pin);
    marker.setMap(map);
    markers.push(marker);
  });
  return markers;
}

export {
  clearInfos,
  hideInfos,
  getMarkerClusterer,
  displayPins,
};
