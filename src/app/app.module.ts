import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table' ;
import { HttpClientModule } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import { MapComponent } from './map/map.component';
import { StatusComponent } from './status/status.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { GoogleChartsModule } from 'angular-google-charts';
import { BaseMapComponent } from './base-map/base-map.component';
import { CustomerComponent } from './customer/customer.component';





//import { MatInputModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule } from "@angular/material";

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    StatusComponent,
    BaseMapComponent,
    CustomerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    HttpClientModule,
    MatSortModule,
    GoogleChartsModule,
    FontAwesomeModule,
    LeafletModule
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
