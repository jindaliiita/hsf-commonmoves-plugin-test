let alreadyDeferred = false;

function buildCustomControls() {
  const container = document.createElement('div');
  container.classList.add('map-controls-container');
  container.innerHTML = `<div class="custom-controls">
        <a data-text="Satellite" data-text-map="Map" class="map-style-hybrid" role="button" aria-label="Satellite View"></a> 
        <a data-text="Draw" data-text-close="Complete Draw" class="map-draw-complete d-none" role="button" aria-label="Complete Draw"></a>
        <a data-text="Draw" data-text-close="Close" class="map-draw" role="button" aria-label="Close"></a> 
        <div class="zoom-controls">
            <a class="map-zoom-in" role="button" aria-label="Zoom In"></a> 
            <a class="map-zoom-out" role="button" aria-label="Zoom Out"></a>
        </div>
    </div>
    <div class="map-draw-tooltip d-none">
       Click points on the map to draw your search
    </div>
    <div class="map-search-wrapper">
    <a data-text-add="Add map boundary" data-text-remove="Remove map boundary" class="map-search-toggle" role="button" aria-label="Remove Map Boundary"></a>
    </div>
    `;
  return container;
}

function initGoogleMapsAPI() {
  if (alreadyDeferred) {
    return;
  }
  alreadyDeferred = true;
  const script = document.createElement('script');
  script.type = 'text/partytown';
  script.id = crypto.randomUUID();
  script.innerHTML = `
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '${window.hlx.codeBasePath}/blocks/property-result-map/map-delayed.js';
    document.head.append(script);
  `;
  document.head.append(script);
}

export default async function renderMap(block) {
  const container = document.createElement('div');
  const mobileClusterInfo = document.createElement('div');
  mobileClusterInfo.classList.add('mobile-cluster-info-window');
  const mobileInfo = document.createElement('div');
  mobileInfo.classList.add('mobile-info-window');
  container.classList.add('property-result-map-container');
  const map = document.createElement('div');
  map.classList.add('property-result-map');
  container.append(map, buildCustomControls(), mobileClusterInfo, mobileInfo);
  block.append(container);
  initGoogleMapsAPI();
}
