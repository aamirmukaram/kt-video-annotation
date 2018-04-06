import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'styles/index.scss';
import 'leaflet';
import 'leaflet-editable';

let map = L.map('map', {
    editable: true,
    crs: L.CRS.Simple
});


let bounds = [[0, 0], [513, 912]];
let imageLayer = L.imageOverlay('https://brightcove04pmdo-a.akamaihd.net/4221396001/4221396001_5743059500001_5743053792001-vs.jpg', bounds).addTo(map);
map.fitBounds(imageLayer.getBounds());

let groupLayers = {
    layerCar: new L.LayerGroup(),
    layerBus: new L.LayerGroup(),
    layerTruck: new L.LayerGroup(),
    layerLane: new L.LayerGroup(),
};

_.each(groupLayers, (layer) => {
    map.addLayer(layer);
});

let groupLayerSelected = null;

map.on('layeradd', (e) => {
    if (e.layer instanceof L.Polyline) {
        e.layer.on('click', L.DomEvent.stop).on('click', e.layer.toggleEdit)
    }
});

map.on('layerremove', (e) => {
    if (e.layer instanceof L.Polyline) {
        e.layer.off('click', L.DomEvent.stop).off('click', e.layer.toggleEdit);
    }
});

map.on('editable:drawing:end', (e) => {
    groupLayers[groupLayerSelected].addLayer(e.layer);
    //map.editTools.startPolyline();
});

map.on('editable:vertex:click', (e) => {
    let layers = e.layer.getLatLngs();
    let idx = layers.findIndex((latlng) => {
        return e.latlng.lat === latlng.lat && e.latlng.lng === latlng.lng;
    });

    if (idx === 0) { //Connect the vertex
        e.layer.addLatLng(e.latlng);
        map.editTools.commitDrawing();
        e.cancel();
    } else if (idx < layers.length - 1) { //Stop from removing
        e.cancel();
    }
});


// let multi = L.polygon([
//     [
//         [
//             [456.43396,180.243011],
//             [530.43396,181.243011],
//             [625.43396,92.243011],
//             [539.43396,35.243011],
//             [409.43396,113.243011],
//             [446.43396,175.243011],
//         ]
//     ]
// ]).addTo(map);
// multi.enableEdit();


setTimeout(function () {
    map.invalidateSize();
}, 500);

document.getElementById('saveBtn').addEventListener('click', event => {
    map.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            console.log('layer', layer.toGeoJSON());
        }
    });
});

document.getElementById('layerGroup').addEventListener('click', event => {
    if (event.target.id === 'layerGroup') return;

    _.each(event.currentTarget.children, (element) => {
        element.className = 'btn btn-secondary btn-lg btn-block';
    });

    event.target.className = 'btn btn-danger btn-lg btn-block';
    groupLayerSelected = event.target.id;
    map.editTools.startPolyline();
});
