import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Map, Control, DomUtil, TileLayer, LayerGroup, Circle, LeafletMouseEvent, Icon, Marker, LatLng, Polyline, Polygon } from 'leaflet';
import { ApiService } from '../core/api/api.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

    constructor(private aService: ApiService) {
    }

    ngOnInit() {

    }

    public map: Map | undefined;

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

    //Tạo overlay group
    private layerGroup = new LayerGroup([this.ormOverlays, this.cCircle]);

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


    ngAfterViewInit() {
        this.map = new Map('map', {
            layers: [this.osmLayer],
            center: [20.976004534102742, 105.83567886166948],
            zoom: 8
        });

        this.setCustomControlAddStaticMarker();
        this.setCustomControlAddMovingMarker();
        //Thêm các layer group vào map
        new Control.Layers(this.mapLayers, this.mapOverlays).addTo(this.map);
        this.map.addEventListener('contextmenu', (e: LeafletMouseEvent) => { this.openContextmenu(e) });
        this.map.addEventListener('click', () => this.isContextMenu = false);
    }

    //#region 2 nút custom control tạo marker
    //add custom control tạo 10 marker tĩnh
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

        let info = new Control({ position: 'topright' });
        info.onAdd = () => {
            return div;
        };
        info.addTo(this.map!);
    }



    //add custom control tạo 10 marker động
    setCustomControlAddMovingMarker() {
        let div = DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.backgroundImage = "url('/assets/images/locate icon red.png')";
        div.style.backgroundSize = "30px 30px";
        div.style.width = '30px';
        div.style.height = '30px';

        div.onclick = () => {
            this.addRandomMovingMarkers();
        }

        let info = new Control({ position: 'topright' });
        info.onAdd = () => {
            return div;
        };
        info.addTo(this.map!);
    }

    //Tạo random marker
    //Icon cho marker
    private locateIcon: any = Icon.extend({
        options: {
            iconSize: [38, 38],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
        },
    });

    //Tạo random 10 marker đứng yên
    addRandomStaticMarkers() {
        for (let i = 0; i < 50; i++) {
            this.add1RandomStaticMarker();
        }
    }

    //Tạo random marker đứng yên
    add1RandomStaticMarker() {
        let y = this.generateRandomNumber(20.4, 22.3)
        let x = this.generateRandomNumber(103, 106.6)
        let newBlackIcon = new this.locateIcon({ iconUrl: '/assets/images/locate icon black.png' });
        let newMarker = new Marker([y, x], { icon: newBlackIcon, draggable: true });
        newMarker.addTo(this.map!).bindTooltip('Static marker!').bindPopup(newMarker.getLatLng().toString());
    }

    //Tạo random 50 marker đứng yên
    addRandomMovingMarkers() {
        for (let i = 0; i < 50; i++) {
            this.add1RandomMovingMarker();
        }
    }

    //Tạo random marker di chuyển
    add1RandomMovingMarker() {
        let y = this.generateRandomNumber(20.4, 22.3)
        let x = this.generateRandomNumber(103, 106.6)
        let newRedIcon = new this.locateIcon({ iconUrl: '/assets/images/locate icon red.png' });
        let newMarker = new Marker([y, x], { icon: newRedIcon });
        newMarker.addTo(this.map!).bindTooltip('Moving marker!');
        this.randomMoving(newMarker, x, y);
    }

    randomMoving(marker: Marker, x: number, y: number) {
        setInterval(() => {
            x = x + ((Math.random() * 0.5) - 0.25) * 0.02;
            y = y + ((Math.random() * 1) - 0.5) * 0.02;
            marker.setLatLng([y, x]);
            marker.bindPopup(marker.getLatLng().toString())
        }, 500)
    }

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
    newPolygon: Polygon | undefined;

    openContextmenu(event: LeafletMouseEvent) {
        this.conMenuX = event.containerPoint.x;
        this.conMenuY = event.containerPoint.y;
        this.contextMenuLatLng = event.latlng;
        this.isContextMenu = true;
        console.log(this.contextMenuLatLng);
    }
    disableContextMenu() {
        this.isContextMenu = false;
    }

    //Thêm marker
    addStaticMarker() {
        let newBlueIcon = new this.locateIcon({ iconUrl: '/assets/images/locate icon blue.png' });
        let newMarker = new Marker(this.contextMenuLatLng, { icon: newBlueIcon, draggable: true });
        newMarker.addTo(this.map!).bindTooltip('Added marker!').bindPopup(newMarker.getLatLng().toString());
    }

    //Thêm circle
    addCircle() {
        new Circle(this.contextMenuLatLng, { radius: 5000 }).addTo(this.map!);
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
        else
        {
            this.isPointPolyline = false;
        }
    }

    //Vẽ polygon
    addPointPolygon(type: number){
        if (type == 0) {
            this.lstLatLngPolygon = [];
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
        else
        {
            this.newPolygon = this.currentPolygon;
            this.currentPolygon?.remove();
            this.newPolygon = new Polygon(this.lstLatLngPolygon, {
                color: 'blue',
                weight: 3
            }).addTo(this.map!).bindTooltip('Added polygon!');
            this.isPointPolygon = false;
        }
    }
    //#endregion
}