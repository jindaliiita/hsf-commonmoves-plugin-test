/* global google */
/* global jsts */

const DRAWING_STARTED = 'MapDrawingStarted';
const DRAWING_ENDED = 'MapDrawingEnded';

let gmap;

let mouseListener;
const lines = [];
let activeLine;
let polygon;

function mouseHandler(e) {
  if (activeLine.getPath().length) {
    activeLine.getPath().setAt(1, e.latLng);
  }
}

/**
 * Check if the line intersects any of the existing ones.
 * @param {Array<google.map.Polyline>} existing list of existing lines
 * @param {google.map.Polyline} potential potential line that may intersect
 * @return {boolean} whether or not the line intersects
 */
function intersects(existing, potential) {
  const coords = [];
  if (existing.length) {
    coords.push(new jsts.geom.Coordinate(existing[0].getPath().getAt(0).lat(), existing[0].getPath().getAt(0).lng()));
    existing.forEach((line) => {
      coords.push(new jsts.geom.Coordinate(line.getPath().getAt(1).lat(), line.getPath().getAt(1).lng()));
    });
    coords.push(new jsts.geom.Coordinate(potential.getPath().getAt(1).lat(), potential.getPath().getAt(1).lng()));
    const simple = jsts.operation.IsSimpleOp.isSimple(new jsts.geom.GeometryFactory().createLineString(coords));
    return !simple; // Simple LineStrings do not intersect.
  }
  return false;
}

/**
 * Clears the map of any lines or polygon
 */
function clearPolygon() {
  lines.forEach((l) => { l.setMap(null); });
  lines.length = 0;
  if (activeLine) {
    activeLine.getPath().clear();
    activeLine.setMap(null);
  }
  if (polygon) {
    polygon.setMap(null);
    polygon = undefined;
  }
}

/**
 * Closes the active polygon, creating the instance and returning it.
 * @return {google.maps.Polygon} the completed polygon
 */
function closePolygon() {
  // eslint-disable-next-line no-unused-expressions
  mouseListener && mouseListener.remove();

  activeLine.getPath().clear();
  activeLine.setMap(null);
  if (lines.length === 1) {
    lines[0].setMap(null);
    lines.length = 0;
  }

  const points = [];
  points.push(lines[0].getPath().getAt(0));
  lines.forEach((line) => {
    points.push(line.getPath().getAt(1));
  });
  polygon = new google.maps.Polygon({
    map: gmap,
    paths: points,
    strokeColor: '#BA9BB2',
    strokeWeight: 2,
    clickable: false,
    fillOpacity: 0,
  });
  return polygon;
}

/**
 * Adds a point to the polygon.
 * If the next line intersects an existing line, it closes the polygon and returns it.
 * @param {google.maps.LatLng} point
 * @return {boolean} if adding this point closed the polygon
 */
function addPolygonPoint(point) {
  const prev = activeLine.getPath().getAt(0);
  if (prev) {
    const line = new google.maps.Polyline({
      clickable: false,
      strokeColor: '#BA9BB2',
      strokeWeight: 2,
      path: [prev, point],
    });
    if (intersects(lines, line)) {
      return true;
    }
    line.setMap(gmap);
    lines.push(line);
  }
  if (lines.length > 1) {
    document.querySelector('.property-search-results.block .search-map-container .custom-controls .map-draw-complete.disabled')?.classList.remove('disabled');
  }
  activeLine.getPath().setAt(0, point);
  return false;
}

/**
 * Starts drawing the polygon by adding a line to the map.
 * Also initiates the tracking line for potential next line in polygon definition.
 *
 * @param {google.maps.Map} map
 */
function startPolygon(map) {
  clearPolygon();
  gmap = map;
  activeLine = new google.maps.Polyline({
    map: gmap,
    clickable: false,
    strokeOpacity: 0,
    icons: [{
      icon: {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 2,
        strokeColor: '#BA9BB2',
      },
      offset: 0,
      repeat: '20px',
    }],
  });
  mouseListener = gmap.addListener('mousemove', mouseHandler);
  gmap.getDiv().dispatchEvent(new CustomEvent(DRAWING_STARTED));
}

export {
  DRAWING_STARTED,
  DRAWING_ENDED,
  startPolygon,
  addPolygonPoint,
  closePolygon,
  clearPolygon,
};
