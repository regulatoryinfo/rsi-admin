import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Map, Control, DomUtil, ZoomAnimEvent , Layer, MapOptions, tileLayer, latLng, LeafletMouseEvent, LatLng, LatLngBounds } from 'leaflet';
//import { NbOAuth2AuthStrategyOptions } from '../auth/public_api';

@Component({
  selector: 'ngx-base-map',
  templateUrl: './base-map.component.html',
  styleUrls: ['./base-map.component.scss',]
})
export class BaseMapComponent implements OnInit, OnDestroy {
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Output() move$: EventEmitter<LatLng> = new EventEmitter;
  @Output() mapMove$: EventEmitter<any> = new EventEmitter;
  @Input() options: MapOptions= {
                      layers:[tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        opacity: 0.7,
                        maxZoom: 19,
                        detectRetina: true,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      })],
                      zoom:1,
                      center:latLng(0,0),
                      
  };
  public map: Map;
  public zoom: number;
  public move: LatLng;
  public mapMove: any;
  public latlngBnds: LatLngBounds;

  constructor() { 
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.map.clearAllEventListeners;
    // this.map.remove();
  };

  onMapReady(map: Map) {
    this.map = map;
    this.map$.emit(map);
    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);
    
  }

  onMapZoomEnd(e: ZoomAnimEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  onMapMouseMove(e:any){
    // console.log("e" + JSON.stringify(e));
    this.move = e.latlng;
    this.move$.emit(this.move);
  }

  onMapMove(e:any){
    this.latlngBnds = this.map.getBounds();
    this.mapMove = this.latlngBnds;
    this.mapMove$.emit(this.mapMove);

  }
}