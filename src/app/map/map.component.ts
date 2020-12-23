import { Component, AfterViewInit } from '@angular/core';
import { Map, Control, DomUtil, TileLayer, LayerGroup, Circle, LeafletMouseEvent, Icon, Marker, LatLng, Polyline, Polygon, MarkerClusterGroup, DivIcon, Point } from 'leaflet';
import { ApiService } from '../core/api/api.service';
import 'leaflet.markercluster';

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
    private cCircle = new Circle([20.976004534102742, 105.83567886166948], { radius: 1000 });

    //Nhóm base layers
    private mapLayers = {
        "Open Street Map": this.osmLayer,
        "Open Topo Map": this.otmLayer,
    };
    //Nhóm overlays
    private mapOverlays = {
        "Open Railway Map": this.ormOverlays,
        "Circle": this.cCircle
    }
    //#endregion


    ngAfterViewInit() {
        this.map = new Map('map', {
            layers: [this.osmLayer],
            center: [20.976004534102742, 105.83567886166948],
            zoom: 8
        });

        //Thêm các layer group vào map
        new Control.Layers(this.mapLayers, this.mapOverlays, { position: 'topright' }).addTo(this.map);

        //Thêm 2 nút tạo marker
        this.setCustomControlAddStaticMarker();
        this.setCustomControlAddDynamicMarker();

        //Chức năng event
        this.map.addEventListener('contextmenu', (e: LeafletMouseEvent) => { this.openContextmenu(e) });
        this.map.addEventListener('click', () => this.isContextMenu = false);

        //Thêm layer cluster
        this.markerClusterGroup.addTo(this.map!);
    }

    //#region 2 nút custom control tạo marker

    private markerClusterGroup = new MarkerClusterGroup({ animate: false });

    //add custom control tạo marker tĩnh
    setCustomControlAddStaticMarker() {
        let div = DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.backgroundImage = "url('/assets/images/locate icon black.png')";
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
        div.style.backgroundImage = "url('/assets/images/locate icon red.png')";
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
        let newBlackIcon = new Icon({ iconUrl: '/assets/images/locate icon black.png', iconSize: [35, 35] });
        let newMarker = new Marker([y, x], { icon: newBlackIcon, draggable: true });
        newMarker.addTo(this.markerClusterGroup).bindTooltip('Static marker!').bindPopup(newMarker.getLatLng().toString());
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
        let newRedIcon = new Icon({ iconUrl: '/assets/images/locate icon red.png', iconSize: [35, 35] });
        let newMarker = new Marker([y, x], { icon: newRedIcon });
        newMarker.addTo(this.markerClusterGroup).bindTooltip('Moving marker!');
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


    //#region Custom context menu
    isContextMenu = false;
    conMenuX = 0;
    conMenuY = 0;
    contextMenuLatLng = new LatLng(0, 0);
    isPointPolyline = false;
    currentPointPolylineLatLng = new LatLng(0, 0);
    isPointPolygon = false;
    lstLatLngPolygon: LatLng[] = [];
    currentPolygon: Polygon | undefined;

    openContextmenu(event: LeafletMouseEvent) {
        this.conMenuX = event.containerPoint.x;
        this.conMenuY = event.containerPoint.y;
        this.contextMenuLatLng = event.latlng;
        this.isContextMenu = true;
    }
    disableContextMenu() {
        this.isContextMenu = false;
    }

    //Thêm marker
    addStaticMarker() {
        let newBlueIcon = new Icon({ iconUrl: '/assets/images/locate icon blue.png', iconSize: [35, 35] });
        let newMarker = new Marker(this.contextMenuLatLng, { icon: newBlueIcon, draggable: true });
        newMarker.addTo(this.markerClusterGroup).bindTooltip('Added marker!').bindPopup(newMarker.getLatLng().toString());
    }

    //Thêm circle
    addCircle() {
        new Circle(this.contextMenuLatLng, { radius: 5000 }).addTo(this.map!).bindTooltip('Added circle!');
    }

    //Vẽ polyline
    addPointPolyline(type: number) {
        if (type == 0) {
            this.currentPointPolylineLatLng = this.contextMenuLatLng;
            this.isPointPolyline = true;
        }
        else if (type == 1) {
            new Polyline([this.contextMenuLatLng, this.currentPointPolylineLatLng], {
                color: 'red',
                weight: 3
            }).addTo(this.map!).bindTooltip('Added polyline!');
            this.currentPointPolylineLatLng = this.contextMenuLatLng;
        }
        else {
            this.isPointPolyline = false;
        }
    }

    //Vẽ polygon
    addPointPolygon(type: number) {
        if (type == 0) {
            this.lstLatLngPolygon = [];
            this.currentPolygon = new Polygon(this.lstLatLngPolygon,);
            this.lstLatLngPolygon.push(this.contextMenuLatLng);
            this.isPointPolygon = true;
        }
        else if (type == 1) {
            this.lstLatLngPolygon.push(this.contextMenuLatLng);
            this.currentPolygon?.remove();
            this.currentPolygon = new Polygon(this.lstLatLngPolygon, {
                color: 'blue',
                weight: 3
            }).addTo(this.map!).bindTooltip('Added polygon!');
        }
        else {
            this.isPointPolygon = false;
        }
    }
    //#endregion
}