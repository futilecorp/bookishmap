import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import {MaptilerLayer} from "@maptiler/leaflet-maptilersdk";


const defaultBackgroundMapStyle = 3;

const circleMarkerOptions = {
  radius: 8,
  fillColor: "#CA4023",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 1
};

const iconMarkerOptions = {
  // see https://leafletjs.com/examples/custom-icons/
};

const featureMarker = (feature, latlng) => {
  const marker = L.circleMarker(latlng, circleMarkerOptions);
  // const marker = L.marker(latlng, iconMarkerOptions);

  marker.on('click', (e) => {
    const props = e.target.feature.properties;
    window.alert("you clicked on feature with name " + props.name);

    // do arbitrary DOM manipulations in the callback

  });
  return marker;
};

var map = L.map("map").setView([52.5105, 13.4061], 12);
map.setMinZoom(10);
map.setMaxBounds(map.getBounds());

const maptilerApi = 'h24s9QHr7NmztAXKJCDP';
const styles = [L.MaptilerStyle.TONER, L.MaptilerStyle.BACKDROP.DARK, L.MaptilerStyle.BASIC.DARK, L.MaptilerStyle.BASIC.LIGHT, L.MaptilerStyle.BRIGHT.DARK, L.MaptilerStyle.BRIGHT.LIGHT, L.MaptilerStyle.DATAVIZ.DARK, L.MaptilerStyle.DATAVIZ.LIGHT];

const markerStyle = null;
const addMarkerEvents = (feature, layer) => {
  // layer.bindPopup(feature.properties.field);
};
const overlay = new L.GeoJSON(null, {pointToLayer: featureMarker, onEachFeature: addMarkerEvents});

overlay.addTo(map);

// const overlay = L.marker([51.5, -0.09])
// .addTo(map)
// .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
// .openPopup();

const layerControl = L.control.layers([], [overlay]).addTo(map);

const baseLayers = [];
styles.forEach((s) => {
  const l = new MaptilerLayer({style: s, apiKey: maptilerApi});
  layerControl.addBaseLayer(l, s.id);
  baseLayers.push(l);
});

baseLayers[defaultBackgroundMapStyle].addTo(map);

document.getElementById("wheelchair_button").addEventListener("click", wheelchairSelected);

document.getElementById("readmore").addEventListener("click", readMore);
document.getElementById("close").addEventListener("click", close);

function wheelchairSelected() {
    fetch(new Request("/map_data.geojson")).then((response) => response.json()).then((data) => {

  data.forEach((o) => {
    if (o.properties['wheelchair']=== 'yes') {
    overlay.addData(o)

    //creating the bookstores result list
    const details = document.createElement('details');
    details.className = "result_item";
    const summary = document.createElement('summary');
    summary.textContent = o.properties['name'];
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');

    p1.textContent = o.properties['addr:street'] + ' ' + o.properties['addr:housenumber'] + 
                  ', ' + o.properties['addr:postcode'] + ' '  + o.properties['addr:city'];
    //needs to be differently formated
    p2.textContent = o.properties['opening_hours'];

    details.appendChild(summary);
    details.appendChild(p1);
    details.appendChild(p2);
    document.getElementById('results').appendChild(details);
  }
  });
});
}

function readMore() {
  document.getElementById('popup').style.display = "flex";
}

function close() {
  document.getElementById('popup').style.display = "none";
}

// https://leafletjs.com/examples/geojson/
fetch(new Request("/map_data.geojson")).then((response) => response.json()).then((data) => {

  data.forEach((o) => {
    overlay.addData(o)

    //creating the bookstores result list
    const details = document.createElement('details');
    details.className = "result_item";
    const summary = document.createElement('summary');
    summary.textContent = o.properties['name'];
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');

    p1.textContent = o.properties['addr:street'] + ' ' + o.properties['addr:housenumber'] + 
                  ', ' + o.properties['addr:postcode'] + ' '  + o.properties['addr:city'];
    //needs to be differently formated
    p2.textContent = o.properties['opening_hours'];

    details.appendChild(summary);
    details.appendChild(p1);
    details.appendChild(p2);
    document.getElementById('results').appendChild(details);
  });
});
