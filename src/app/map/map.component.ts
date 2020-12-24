import { Component, AfterViewInit } from '@angular/core';
import { Map, Control, DomUtil, TileLayer, Icon, Marker, MarkerClusterGroup, FeatureGroup, DrawEvents } from 'leaflet';
import { ApiService } from '../core/api/api.service';
import 'leaflet.markercluster';
import 'leaflet-draw';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

    constructor(private aService: ApiService) {
    }


    //#region Tạo các layer và các overlay
    private map: Map | undefined;

    //Tạo các map layer
    private osmLayer = new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    private otmLayer = new TileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //Tạo các overlay
    private ormOverlays = new TileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    //Nhóm base layers
    private mapLayers = {
        "Open Street Map": this.osmLayer,
        "Open Topo Map": this.otmLayer,
    };
    //Nhóm overlays
    private mapOverlays = {
        "Open Railway Map": this.ormOverlays,
        "Cty Bình Anh": new Marker([20.976004534102742, 105.83567886166948], { icon: new Icon({ iconUrl: '/assets/images/house icon.png', iconSize: [35, 35] }), draggable: true }).bindPopup('Công ty Bình Anh!')
    }
    //#endregion


    ngAfterViewInit() {
        this.map = new Map('map', {
            layers: [this.osmLayer],
            center: [20.976004534102742, 105.83567886166948],
            zoom: 17
        });

        //Thêm các layer group vào map
        new Control.Layers(this.mapLayers, this.mapOverlays, { position: 'topright' }).addTo(this.map);

        //Thêm 2 nút tạo marker
        this.setCustomControlAddStaticMarker();
        this.setCustomControlAddDynamicMarker();
        this.setControlDraw();

        //Chức năng event
        this.map.addEventListener('draw:created', (e: any) => this.addDrawToLayer(e));

        //Thêm layer cluster marker
        this.markerClusterGroup.addTo(this.map!);

        //Thêm layer vẽ hình
        this.editableLayers.addTo(this.map!);
    }

    //#region 2 nút custom control tạo marker

    private markerClusterGroup = new MarkerClusterGroup({ animate: false });

    //add custom control tạo marker tĩnh
    setCustomControlAddStaticMarker() {
        let div = DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.backgroundImage = "url('/assets/images/car icon black.png')";
        div.style.backgroundSize = "30px 30px";
        div.style.width = '30px';
        div.style.height = '30px';

        div.onclick = () => {
            this.addRandomStaticMarkers();
        }

        let info = new Control({ position: 'topleft' });
        info.onAdd = () => {
            return div;
        };
        info.addTo(this.map!);
    }

    //add custom control tạo marker động
    setCustomControlAddDynamicMarker() {
        let div = DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.backgroundImage = "url('/assets/images/car icon red.png')";
        div.style.backgroundSize = "30px 30px";
        div.style.width = '30px';
        div.style.height = '30px';

        div.onclick = () => {
            this.addRandomDynamicMarkers();
        }

        let info = new Control({ position: 'topleft' });
        info.onAdd = () => {
            return div;
        };
        info.addTo(this.map!);
    }

    //Tạo random nhiều marker tĩnh
    addRandomStaticMarkers() {
        for (let i = 0; i < 100; i++) {
            this.add1RandomStaticMarker();
        }
    }

    //Tạo random marker tĩnh
    add1RandomStaticMarker() {
        let y = this.generateRandomNumber(20.4, 22.3)
        let x = this.generateRandomNumber(103, 106.6)
        let newBlackCarIcon = new Icon({ iconUrl: '/assets/images/car icon black.png', iconSize: [20, 34] });
        let newMarker = new Marker([y, x], { icon: newBlackCarIcon, draggable: true });
        newMarker.addTo(this.markerClusterGroup).bindTooltip('Static marker!', { direction: 'top', permanent: true, offset: [0, -15], opacity: 0.7 }).bindPopup(newMarker.getLatLng().toString());
    }

    //Tạo random nhiều marker động
    addRandomDynamicMarkers() {
        for (let i = 0; i < 100; i++) {
            this.add1RandomDynamicMarker();
        }
    }

    //Tạo random marker động
    add1RandomDynamicMarker() {
        let y = this.generateRandomNumber(20.4, 22.3)
        let x = this.generateRandomNumber(103, 106.6)
        let newRedCarIcon = new Icon({ iconUrl: '/assets/images/car icon red.png', iconSize: [20, 34] });
        let newMarker = new Marker([y, x], { icon: newRedCarIcon });
        newMarker.addTo(this.markerClusterGroup).bindTooltip('Moving marker!', { direction: 'top', permanent: true, offset: [0, -15], opacity: 0.7 });
        this.randomMoving(newMarker, x, y);
    }

    //Set chuyển động ngẫu nhiên cho marker
    randomMoving(marker: Marker, x: number, y: number) {
        setInterval(() => {
            x = x + ((Math.random() * 0.5) - 0.25) * 0.02;
            y = y + ((Math.random() * 1) - 0.5) * 0.02;
            marker.setLatLng([y, x]);
            marker.bindPopup(marker.getLatLng().toString())
        }, 500)
    }

    //Tạo số ngẫu nhiên
    private generateRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
    //#endregion


    //#region Leaflet-draw

    private editableLayers = new FeatureGroup();

    //Thêm nút draw
    setControlDraw() {
        let drawPluginOptions: any = {
            position: 'topright',
            draw: {
                polygon: {
                    shapeOptions: {
                        color: 'magenta'
                    }
                },
                rectangle: {
                    shapeOptions: {
                        color: 'red'
                    }
                },
                circlemarker: {
                    color: 'black'
                },
                circle: {
                    shapeOptions: {
                        color: 'limegreen'
                    }
                },
                marker: {
                    icon: new Icon({ iconUrl: '/assets/images/car icon blue.png', iconSize: [20, 34] })
                },
            },
            edit: {
                featureGroup: this.editableLayers,
            }
        };
        let drawControl = new Control.Draw(drawPluginOptions);
        drawControl.addTo(this.map!);
    }

    //Thêm hình vừa vẽ vào layer
    addDrawToLayer(e: DrawEvents.Created) {
        let type = e.layerType,
            layer: any = e.layer;

        if (type === 'marker') {
            layer.bindTooltip('Added marker!', { direction: 'top', permanent: true, offset: [0, -15], opacity: 0.7 }).bindPopup(layer.getLatLng().toString());
        }
        layer.addTo(this.editableLayers);
    }
    //#endregion
}