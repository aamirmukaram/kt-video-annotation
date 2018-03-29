import 'styles/index.scss';
import 'leaflet';
import 'leaflet.path.drag';
import 'leaflet-editable';

let startPoint = [43.1249, 1.254];
const tileUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png';
const mapBoxAccessToken = 'pk.eyJ1IjoiYWFtaXJtdWthcmFtIiwiYSI6ImNqZmF5czJkcjF6cWsyd25yd2JkdHQ3djkifQ.DZAJFDVfGGd1JqwTq9tcbw';

let map = L.map('map', {
    editable: true ,
    crs: L.CRS.Simple
});

// L.tileLayer(tileUrl + '?access_token=' + mapBoxAccessToken, {
//     maxZoom: 20,
//     attribution: 'attribution',
//     id: 'mapbox.streets'
// }).addTo(map);

let bounds = [[0,0], [1000,1000]];
L.imageOverlay('https://brightcove04pmdo-a.akamaihd.net/4221396001/4221396001_5743059500001_5743053792001-vs.jpg?pubId=4221396001&videoId=5743053792001', bounds).addTo(map);
map.fitBounds(bounds);


L.NewPolygonControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        let container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Create a new polygon';
        link.innerHTML = '▱';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                map.editTools.startPolygon();
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
        let container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Create a new polygon';
        link.innerHTML = '▱▱';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                if (!map.editTools.currentPolygon) return;
                map.editTools.currentPolygon.editor.newShape();
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

map.on('layeradd', function (e) {
    if (e.layer instanceof L.Polygon) e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
});
map.on('layerremove', function (e) {
    if (e.layer instanceof L.Polygon) e.layer.off('dblclick', L.DomEvent.stop).off('dblclick', e.layer.toggleEdit);
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


// map._onResize();
setTimeout(function(){map.invalidateSize();});
