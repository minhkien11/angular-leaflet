/// <reference types='leaflet.locatecontrol' />
/// <reference types='leaflet-loading' />
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Map, Control, DomUtil, Layer, MapOptions, tileLayer, latLng, LeafletEvent, LocationEvent, circle, polygon } from 'leaflet';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css',]
})
export class MapComponent implements OnInit, OnDestroy {

    //Khởi tạo thông tin map ban đầu
    options: MapOptions = {
        layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        })],
        zoom: 14,
        center: latLng(20.976004534102742, 105.83567886166948)
    };

    public map: any;
    public zoom: number = 0;
    public location = "";

    //add custom control
    setCustomControl() {
        let div = DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        div.style.backgroundSize = "30px 30px";
        div.style.width = '30px';
        div.style.height = '30px';

        div.onclick = () =>{
            console.log(12,'Nút custom control click')
        }

        let info = new Control({ position: 'topright' });
        info.onAdd = () => {
            return div;
        };
        info.addTo(this.map);
    }

    constructor() {
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        //Xóa map khi xóa component
        this.map.clearAllEventListeners;
        this.map.remove();
    };

    //Sau khi map đã hiển thị
    onMapReady(map: Map) {
        this.map = map;

        this.setCustomControl();
    }

    //Lấy thông tin location
    onNewLocation(location: LocationEvent) {
        this.location = location.latlng.toString();
    }

    //Set thuộc tính cho nút locate
    public locateOptions: Control.LocateOptions = {
        setView: false,
        flyTo: false,
        keepCurrentZoomLevel: true,
        locateOptions: {
            enableHighAccuracy: true,
        },
        icon: 'material-icons md-18 target icon',
        clickBehavior: {
            inView: 'stop',
            outOfView: 'setView',
            inViewNotFollowing: 'setView'
        }
    };

    //Set layer
    layersControl = {
        baseLayers: {
            'Open Street Map': tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }),
            'Open Topo Map': tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
            }),
            'Open Railway Map': tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
                maxZoom: 19,
            })
        },
        overlays: {
            'Big Circle': circle([20.976004534102742, 105.83567886166948], { radius: 1000 }),
            'Big Square': polygon([[20.976004534102742, 105.83567886166948], [21.976004534112742, 106.83567886066948], [22.976004534202742, 107.83567886366948], [23.976004534152742, 108.83567886176948]])
        }
    }

}
