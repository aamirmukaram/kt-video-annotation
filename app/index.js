import $ from 'jquery';
import videojs from 'video.js';
import captureVideoFrame from 'capture-video-frame';
import 'popper.js';
import 'bootstrap';
import 'styles/index.scss';
import 'leaflet';
import 'leaflet-editable';


// videojs-framebyframe-plugin
var VjsButton = videojs.getComponent('Button');
var FBFButton = videojs.extend(VjsButton, {
    constructor: function (player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.frameTime = 1 / options.fps;
        this.step_size = options.value;
        this.on('click', this.onClick);
    },

    onClick: function () {
        // Start by pausing the player
        this.player.pause();
        // Calculate movement distance
        var dist = this.frameTime * this.step_size;
        this.player.currentTime(this.player.currentTime() + dist);
    },
});

function framebyframe(options) {
    var player = this,
        frameTime = 1 / 30; // assume 30 fps

    player.ready(function () {
        options.steps.forEach(function (opt) {
            player.controlBar.addChild(
                new FBFButton(player, {
                    el: videojs.createEl(
                        'button',
                        {
                            className: 'vjs-res-button vjs-control',
                            innerHTML: '<div class="vjs-control-content" style="font-size: 11px; line-height: 28px;"><span class="vjs-fbf">' + opt.text + '</span></div>'
                        },
                        {
                            role: 'button'
                        }
                    ),
                    value: opt.step,
                    fps: options.fps,
                }),
                {}, opt.index);
        });
    });
}

videojs.plugin('framebyframe', framebyframe);

let map = L.map('map', {
    editable: true,
    crs: L.CRS.Simple
});

let videoInstance = null;

let groupLayers = {
    layerCar: new L.LayerGroup(),
    layerBus: new L.LayerGroup(),
    layerTruck: new L.LayerGroup(),
    layerLane: new L.LayerGroup(),
};



let groupLayerSelected = null;

let bootApp = () => {
    videoInstance = videojs(document.querySelector('.video-js'), {
        controls: true,
        autoplay: true,
        preload: 'auto',
        plugins: {
            framebyframe: {
                fps: 29.97,
                steps: [
                    { text: '-5', step: -5 },
                    { text: '-1', step: -1 },
                    { text: '+1', step: 1 },
                    { text: '+5', step: 5 },
                ]
            }
        }
    });
};


let initAnnotation = () => {

    var image = captureVideoFrame('my-player_html5_api', 'png').dataUri;

    let bounds = [[0, 0], [513, 912]];
    let imageLayer = L.imageOverlay(image, bounds).addTo(map);
    map.fitBounds(imageLayer.getBounds());

    let onLayerAdd = (e) => {
        if (e.layer instanceof L.Polyline) {
            e.layer.on('click', L.DomEvent.stop).on('click', e.layer.toggleEdit)
        }
    };

    let onLayerRemove = (e) => {
        if (e.layer instanceof L.Polyline) {
            e.layer.off('click', L.DomEvent.stop).off('click', e.layer.toggleEdit);
        }
    };

    let onDrawingEnd = (e) => {
        groupLayers[groupLayerSelected].addLayer(e.layer);
        //map.editTools.startPolyline();
    };

    let onVertexClicked = (e) => {
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
    };

    map.on('layeradd', onLayerAdd);
    map.on('layerremove', onLayerRemove);
    map.on('editable:drawing:end', onDrawingEnd);
    map.on('editable:vertex:click', onVertexClicked);

    setTimeout(function () {
        map.invalidateSize();
    }, 500);
};

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

document.addEventListener("DOMContentLoaded", bootApp);

document.querySelector('#init-annotation').addEventListener('click', initAnnotation);
