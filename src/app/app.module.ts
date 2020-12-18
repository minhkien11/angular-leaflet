import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    LeafletModule,
    NgxLeafletLocateModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
