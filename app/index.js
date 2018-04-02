import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'styles/index.scss';
import 'leaflet';
import 'leaflet.path.drag';
import 'leaflet-editable';

let map = L.map('map', {
    editable: true,
    crs: L.CRS.Simple
});


let bounds = [[0, 0], [513, 912]];
let imageLayer = L.imageOverlay('https://brightcove04pmdo-a.akamaihd.net/4221396001/4221396001_5743059500001_5743053792001-vs.jpg', bounds).addTo(map);
map.fitBounds(bounds);

let groupLayers = {
    layerCar: new L.LayerGroup(),
    layerBus: new L.LayerGroup(),
    layerTruck: new L.LayerGroup(),
    layerLane: new L.LayerGroup(),
};

_.each(groupLayers, (layer) => {
    layer.addTo(map);
});

let groupLayerSelected = null;


L.NewPolygonControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        let container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        let link = Object.assign(L.DomUtil.create('a', '', container), {
            href: '#',
            title: 'Create a new polygon',
            innerHTML: '▱'
        });
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                if (!groupLayerSelected) return;

                map.editTools.startPolygon();// Creates new polygon
            });
        container.style.display = 'block';
        map.editTools.on('editable:enabled', function (e) {
            container.style.display = 'none';
        });
        map.editTools.on('editable:disable', function (e) {
            container.style.display = 'block';
        });
        return container;
    }
});
L.AddPolygonShapeControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        let container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        let link = Object.assign(L.DomUtil.create('a', '', container), {
            href: '#',
            title: 'Create a new polygon',
            innerHTML: '▱▱'
        });
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                if (!map.editTools.currentPolygon) return;
                map.editTools.currentPolygon.editor.newShape();// Creates new shape from current polygon
            });
        container.style.display = 'none';
        map.editTools.on('editable:enabled', function (e) {
            container.style.display = 'block';
        });
        map.editTools.on('editable:disable', function (e) {
            container.style.display = 'none';
        });
        return container;
    }
});

map.addControl(new L.NewPolygonControl());
map.addControl(new L.AddPolygonShapeControl());

map.on('layeradd', (e) => {
    if (e.layer instanceof L.Polygon) {
        e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit)
    }
});

map.on('layerremove', (e) => {
    if (e.layer instanceof L.Polygon) {
        e.layer.off('dblclick', L.DomEvent.stop).off('dblclick', e.layer.toggleEdit);
    }
});

map.on('editable:drawing:end', function (e) {
    groupLayers[groupLayerSelected].addLayer(e.layer);
});

map.editTools.on('editable:enable', function (e) {
    if (this.currentPolygon) this.currentPolygon.disableEdit();
    this.currentPolygon = e.layer;
    this.fire('editable:enabled');
});
map.editTools.on('editable:disable', function (e) {
    delete this.currentPolygon;
});

// let poly = L.polygon([
//     [
//         [43.1239, 1.259],
//         [43.123, 1.263],
//         [43.1252, 1.265],
//         [43.1250, 1.261]
//     ],
//     [
//         [43.124, 1.263],
//         [43.1236, 1.261],
//         [43.12475, 1.262]
//     ]
// ]).addTo(map);

//poly.enableEdit();


setTimeout(function () {
    map.invalidateSize();
}, 100);

document.getElementById('saveBtn').addEventListener('click', event => {
    map.eachLayer(layer => {
        if (layer instanceof L.Polygon) {
            console.log('layer', layer.toGeoJSON());
        }
    });
});

document.getElementById('layerGroup').addEventListener('click', event => {
    if (event.target.id === 'layerGroup') return;

    if (~event.target.className.indexOf('btn-danger')) {
        event.target.className = 'btn btn-secondary btn-lg btn-block';
        groupLayerSelected = null;
        return;
    }

    _.each(event.currentTarget.children, (element) => {
        element.className = 'btn btn-secondary btn-lg btn-block';
    });

    event.target.className = 'btn btn-danger btn-lg btn-block';
    groupLayerSelected = event.target.id;
});
