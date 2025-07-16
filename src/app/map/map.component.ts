import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Self, HostListener,Output, Input, EventEmitter} from '@angular/core';
import { Map, Util, DomUtil, Marker, rectangle, polyline,polygon, FeatureGroup, featureGroup, LatLng, tileLayer, Icon, icon, MapOptions, canvas, geoJSON, circleMarker, LayerGroup, CircleMarker, circle, marker, divIcon, Popup, vectorGrid, DomEvent, latLng} from 'leaflet';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { GlobalVars } from '../common/globals'
import 'leaflet-bing-layer';
import 'leaflet.vectorgrid';
import { BaseMapComponent } from '../base-map/base-map.component';
//import { GoogleChartComponent } from 'angular-google-charts';
import { faLayerGroup, faArrowRight, faArrowLeft, faAngleDown, faAngleUp, faEye, faEyeSlash, faExpand, faXmark, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { SelectionModel } from '@angular/cdk/collections';
import * as Vincenty from 'node-vincenty';
import { Observable, Subject, of } from 'rxjs'; 
import { debounceTime, distinctUntilChanged, switchMap,map } from 'rxjs/operators';
import { MAT_PAGINATOR_INTL_PROVIDER_FACTORY } from '@angular/material/paginator';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  org_id = GlobalVars.org_id;
  public url = 'https://app.regulatorysolutions.us/data/searchLocations/' + this.org_id;
  public locSearch = '';

  pe_approved = GlobalVars.pe_approved;
  period_end = GlobalVars.period_end;

  bt = localStorage.getItem('bdcToken');
  public locations: Observable<any>; // Observable<any[]>;  
  public apLocations: Observable<any>;
  public towerLocations: Observable<any>;

  private searchTerms = new Subject<string>(); 
  private searchApTerms = new Subject<string>();
  private searchTowerTerms = new Subject<string>();   
  public selLocation = '';  
  public flag: boolean = true;
  selFlag:boolean = true;
  selAp: any;
  selTower: any;
  searchtype: string = 'locations';
  showClutter30: boolean = false;
  showClutter10: boolean = false;

  wsvccount: number;
  totlocs: number;


  layergroup = faLayerGroup;
  arrowRight = faArrowRight;
  arrowLeft = faArrowLeft;
  angleDown = faChevronDown;
  angleUp = faChevronUp;
  eye = faEye;
  eyeSlash = faEyeSlash;
  expand = faExpand;
  close = faXmark;
  


  
  company = GlobalVars.company;

  filer: any;

  colorScheme = {
    domain: ['#8B4513', '#00ff00', '#0000ff', '#ff0000']
  };
  
  gchtOptions = {
    colors: ['#8B4513', '#00ff00', '#0000ff', '#ff00ff', '#ff0000'],
    crosshair: {trigger: 'both',orientation: 'vertical'},
    selectionMode: 'multiple',
    focusTarget: 'category',
    legend: {position: 'bottom'},
    vAxis: {title: 'Elevation'},
    hAxis: {title: 'Distance'},
    seriesType: 'line',
    series: {0: {type: 'area'},
             1: {type: 'line'}
            },
    
     
  }
  

  activeapShapes:any = [];
  activefreqRad:any = [];
  points_layers: any  = [];
  tilelayerPopup: any;
  points_tile_layers: any = [];
  siteData: any;
  activeSites: any = [];
  serviceLocs: any;
  fiberserviceLocs: any;
  cableserviceLocs: any;
  dslserviceLocs: any;
  cnheatserviceLocs: any;
  copperserviceLocs: any;
  boundsData: any;
  fiberboundsData: any;
  cableboundsData: any;
  dslboundsData: any;
  copperboundsData: any;
  apData: any;
  showBest: boolean = false;
  bestAp: string;
  bestApId: number;
  cnheatData: any;
  

  qualShow:boolean = false;
  networkShow:boolean = true;
  
  
  locAps: any;

  gchtColumns = ['Distance','Terrain','Clutter','Freznel','Freznel_60','LOS'];

  qualified:boolean = false;
  chtdata:any = [];
  showGraphs:boolean = false;
  graphsMin:boolean = false;
  showQualfrm:boolean = false;
  qualprofs:any = [];
  profShow: boolean = false;

  profMouseObj:any;
  qualifyObjs: any;
  qualifyLos: any;
  bigProfdata: any;
  frequency_colors: any = [];

  private map: Map;

  private zoom: number = 10;
 
  private latlng: LatLng;

  currentLat: number;
  currentLon: number;

  bufferObjs: any;
  exclusionObjs: any;

  latlngBnds: any;

  mapZoom =  5;
  mapCenter = new LatLng(39.147079, -97.185059 );

  layerControl: any;
  allOverlays:any = {};

  
  receiveMap(map: Map) {
    const self = this;
    this.map = map;
    console.log("Setting map to mapCenter " + this.mapCenter.lat + "/" + this.mapCenter.lng);
    this.map.setView(this.mapCenter,5);
    this.layerControl = this.basicLayers;
    this.getTiles();
    this.map.createPane('locations');
    this.map.getPane('locations').style.zIndex = '690';
    this.map.createPane('qualify');
    this.map.getPane('qualify').style.zIndex = '699';
  
    
    // this.buildLayer(this.appSiteobjs,'Sites');
   
    self.doMapstuff()
   /*  else{
      const centerlat = this.activeSites[0].lat;
      const centerlon = this.activeSites[0].lon;
      self.map.setView(new LatLng(centerlat,centerlon ),14);
    }  */

  }
 
  receiveZoom(zoom: number) {
     this.zoom = zoom;
     console.log("zoom " + this.zoom);
     if(this.zoom >= 16){
      
      /* if(this.map.hasLayer(this.allOverlays["Application Sites"])){
        this.map.removeLayer(this.allOverlays["Application Sites"]);
        this.allOverlays["Application Sites_icon"].addTo(this.map);

      }  */

     /*  if(this.map.hasLayer(this.allOverlays["Sites"])){
        this.map.removeLayer(this.allOverlays["Sites"]);
        this.allOverlays["Sites_icon"].addTo(this.map);

      }  */


     }else{
      /* if(this.map.hasLayer(this.allOverlays["Application Sites_icon"])){
        this.map.removeLayer(this.allOverlays["Application Sites_icon"]);
        this.allOverlays["Application Sites"].addTo(this.map);

      } */
     /*  if(this.map.hasLayer(this.allOverlays["Sites_icon"])){
        this.map.removeLayer(this.allOverlays["Sites_icon"]);
        this.allOverlays["Sites"].addTo(this.map);

      } */


     }
  }

  receiveMove(move:any){
  
    this.currentLat = move.lat.toFixed(5);
    this.currentLon = move.lng.toFixed(5);
    
  }

  receiveMapMove(e:any){
    console.log(e);
    this.latlngBnds = e;
  }

  findCenter(points:any){
    const self = this;
    const latlngBnds = this.map.getBounds();
    let maxlat = 0;
    let minlat = 0;
    let minlon = 0;
    let maxlon = 0;
    let centerlat = 0;
    let centerlon = 0;
    let ptArray:any = [];

    let zoom = 16;
    let ptcnt = 0;
    points.forEach(function(pt:any){
      ptcnt ++;
      /* if (ptcnt == 1){
        minlat = pt.lat;
        maxlat = pt.lat;
        minlon = pt.lon;
        maxlon = pt.lon;
      }else{
        if(pt.lat > maxlat){
          maxlat = pt.lat;
        }
        if(pt.lat < minlat){
          minlat = pt.lat;
        }
        if(pt.lon > maxlon){
          maxlon = pt.lon;
        }
        if(pt.lon < minlon){
          minlon = pt.lon;
        }

      }

      if (ptcnt == points.length){
        let latinc = (maxlat - minlat)/2;
        let loninc = ((-minlon) - (-maxlon))/2;

        centerlat = minlat + latinc;
        centerlon = maxlon - loninc;

        minlat = minlat - 0.025;
        maxlat = maxlat + 0.025;
        minlon = minlon - 0.025;
        maxlon = maxlon + 0.025;

        
        
        self.map.setView(new LatLng(centerlat, centerlon ),zoom);

      } */
      ptArray.push([pt.lat,pt.lon]);

      
    })
    if(ptArray.length == 1){
      this.map.setView(new LatLng(ptArray[0][0],ptArray[0][1]),5);
    }else{
      console.log("fitting bounds to " + ptArray.length);
      self.map.fitBounds(ptArray);
    }
  }

  showLayercontrol(){
    this.layerControlvisible = !this.layerControlvisible;
  }


  toggleTile() {
    this.tileShow = !this.tileShow;
  }

  toggleDatasets() {
    this.datasetsShow = !this.datasetsShow;
  }


  tilelayerChange(name:string, isSelected:boolean, section:string) {
    const self = this;
    // const lcChecks = (this.form.controls.name as FormArray);
    let lcArray = [];
    lcArray = this.layerControl;
    if (section === 'Tiles') {
      lcArray = this.tileLayers;
      // console.log('changing tile layer');
    }


    let foundlayer = false;

    // look through each object to see if they need to be turned off
    lcArray.forEach(function(LClayer:any) {
        const lcLayername = LClayer.name;
        if (lcLayername === name) {
          foundlayer = true;
          // turn off all sublayers if on else turn on sublayers marked as selected
          const lcSublayers = LClayer.layers;
          if (isSelected === true) {
            LClayer.isSelected = true;
            // turn on all sublayers currently marked as on
            if (lcSublayers.length > 0) {
              lcSublayers.forEach(function(sublayer:any) {
                const subname = sublayer.name;
                const subselect = sublayer.isSelected;
                if (subselect) {
                  if (self.allOverlays[subname]) {
                    if (sublayer.zIndex) {
                      self.allOverlays[subname].setZIndex(sublayer.zIndex);
                    }
                    self.allOverlays[subname].addTo(self.map);

                  }
                }

              });
            }
          } else {
            LClayer.isSelected = false;
            // turn off all sublayers, but leave their own object isSelected alone
            if (lcSublayers.length > 0) {
              lcSublayers.forEach(function(sublayer:any) {
                const subname = sublayer.name;
                if (self.map.hasLayer(self.allOverlays[subname])) {
                  self.map.removeLayer(self.allOverlays[subname]);
                }

              });
            }
            LClayer.isSelected = false;
          }

        } else {
          // check all sublayers to see if name is one of those
          const lcSublayers = LClayer.layers;
          lcSublayers.forEach(function(sublayer:any) {
            const subname = sublayer.name;
            if (name === subname) {
              foundlayer = true;
              if (isSelected) {
                // now see if it is a singleSelect and turn off other layers if it is
                if (LClayer.singleSelect && LClayer.singleSelect === 1) {
                  self.turnOffOtherLayers(subname, lcSublayers);
                }
                if (self.allOverlays[subname]) {
                  if (sublayer.zIndex) {
                    self.allOverlays[subname].setZIndex(sublayer.zIndex);
                  }
                  self.allOverlays[subname].addTo(self.map);

                }
                sublayer.isSelected = true;
              } else {
                if (self.map.hasLayer(self.allOverlays[subname])) {
                  self.map.removeLayer(self.allOverlays[subname]);
                }
                sublayer.isSelected = false;
              }

            }

          });
        }
    });

    //GlobalVars.layerControl = this.layerControl;

  }

  // turns off other layers in a layer group if only one is supposed to be on at a time
  turnOffOtherLayers(name:string, layers:any) {
    const self = this;
    layers.forEach(function(sublayer:any) {
      const subname = sublayer.name;
      if (subname !== name) {
        if (self.map.hasLayer(self.allOverlays[subname])) {
          // var zindex =
          self.map.removeLayer(self.allOverlays[subname]);
        }
        sublayer.isSelected = false;
      }


    });
  }

  bingMapskey:string = 'AtbnqglVZkEBgFD6RbmKGM_0Oql2dMKxk5Kf-eKyLn_rIZhaUxnvBdExbrNFsJD-';

  getTiles() {
    // const activeLayer = new L.LayerGroup();
    const hybridLayer:any = tileLayer.bing( {'bingMapsKey': this.bingMapskey, 'imagerySet': 'AerialWithLabels'} );
    this.osm['name'] = 'OSM Roads';
    hybridLayer['name'] = 'Aerial Hybrid';
    this.stamenTopoRelief['name'] = 'Terrain';
    this.stamenTonerHybrid['name'] = 'Roads';
    this.stamenToner['name'] = 'Roads';
    //this.allOverlays['OSM Roads'] = this.osm;
    this.allOverlays['OSM Roads'] = this.stamenToner;
    this.allOverlays['Aerial Hybrid'] = hybridLayer;
    this.allOverlays['Terrain'] = this.esriRelief;
    //this.allOverlays['Roads'] = this.stamenTonerHybrid;
    this.allOverlays['Roads'] = this.stamenToner;
    this.allOverlays['Clutter'] = this.clutterTiles;
    this.allOverlays['Clutter30'] = this.clutterTiles30;
    this.buildLayercontrol('Tiles');

  }

  buildLayercontrol(l){
    var self = this;
    console.log("building lc for " + l);
    var lcArray = [];
    lcArray = this.layerControl;
    if(l == 'Tiles'){
      lcArray = this.tileLayers;
    }

    if(l == 'Qualify'){
      lcArray = this.qualifyLayers;
    }
    /*if(l == 'Frequencies'){
      lcArray = this.frequencyLayers;
    }
    
    if (l == 'Viewsheds'){
      lcArray = this.viewShedlayers;

    }

    if (l == 'Search Results'){
      lcArray = this.searchLayers;

    }

    if (l == 'What If'){
      lcArray = this.whatifLayers;

    } */
    
    
        //const lcChecks = (this.form.controls.name as FormArray);
        lcArray.forEach(function(LClayer){
            var lcLayername = LClayer.name;
            if(lcLayername == l){
              var lcSublayers = LClayer.layers;
              if(LClayer.isSelected){
                if(lcSublayers.length > 0){
                  lcSublayers.forEach(function(sublayer){
                    var subname = sublayer.name;
                    var subselect = sublayer.isSelected;
                    
                    if (subselect){
                      if(self.allOverlays[subname]){    
                        console.log("adding subname " + subname);
                        /*if(subname == "Qualify APs"){
                          self.allOverlays[subname].setZIndex(1);
                          self.allOverlays["Serviceable Locations"].setZIndex(999);
                        }
                        if(subname == "Serviceable Locations"){
                          self.allOverlays[subname].setZIndex(999);
                        } */
                        self.allOverlays[subname].addTo(self.map);
                        /* if (subname == "Qualify APs") {
                          self.allOverlays[subname].setZIndex(1);
                          self.allOverlays["Serviceable Locations"].bringToFront();
                        } */
                      }
                    }
                  })
                }
              }else{
                if(l == 'Tiles'){

                  if(lcSublayers.length > 0){

                  }  
              }
            }


          }else{
            if(l=='Tiles'){
              var lcSublayers = LClayer.layers;
                if(LClayer.isSelected){
                  if(lcSublayers.length > 0){
                    lcSublayers.forEach(function(sublayer){
                      var subname = sublayer.name;
                      var subselect = sublayer.isSelected;
                      
                      if (subselect){
                        if(self.allOverlays[subname]){    
                          console.log("adding subname " + subname);
                        
                          self.allOverlays[subname].addTo(self.map);
                        
                        }
                      }
                    })
                  }
                }
            }
          
          }
        }
      )
    
    if(l == 'Sites'){
      self.findCenter(self.siteData);
    }

  }

  hideLayercontrol(){
    this.layerControlvisible = false;

  }



  mapLayers: any ;

  mapPointData: any ;
  mapVectorData: any ;
  userMapData: any;

  // mapCenter = L.latLng( { lat: 39.147079, lng: -97.185059 } );
  mapOptions = {};

  options: any = {
    
    zoom: this.mapZoom,
    center: this.mapCenter,
    noWrap: true,
  };


  tileLayers: any =  [
    {'name': 'Base Maps', 'isSelected': true, 'category': 'tiles', 'singleSelect': 1,
      'layers': [ {'name': 'OSM Roads', 'isSelected': true, 'zIndex': 1},
                {'name': 'Aerial Hybrid', 'isSelected': false, 'zIndex': 1},
                {'name': 'Terrain', 'isSelected': false, 'zIndex': 4},
                {'name': 'Clutter', 'isSelected': false, 'zIndex': 3},
                //{'name': 'Clutter30', 'isSelected': false, 'zIndex': 2},

      ],

    },
    {'name': 'Overlays', 'isSelected': false, 'category': 'tiles', 'singleSelect': 0,
    'layers': [{'name': 'Roads', 'isSelected': false, 'zIndex': 10},
            ],
    },
  ];

  basicLayers = [
    {'name':'Sites', 'isSelected':true, 'category': 'network',
     'layers':[{'name':'Active Sites','isSelected':true,'show':true},
             /*  {'name':'Proposed Sites','isSelected':true},
              {'name':'Inactive Sites','isSelected':false}  */
      ],
    },
    {'name':'APs', 'isSelected':false, 'category': 'network',
     'layers':[{'name':'Active APs','isSelected':false,'show':true},
              {'name':'AP Frequency','isSelected':false,'show':true},
              /* {'name':'Proposed APs','isSelected':true},
              {'name':'Inactive APs','isSelected':false} */ 
      ],
    },
    {'name':'cnHeat', 'isSelected':false, 'category': 'network',
     'layers':[{'name':'cnHeat Polygons','isSelected':false,'show':false},
              
      ],
    },

    {'name':'Network Boundaries', 'isSelected':false, 'category': 'network',
     'layers':[{'name':'Wireless Bounds','isSelected':false,'show':false},
              {'name':'Unlicensed Bounds','isSelected':false,'show':false},
              {'name':'Licensed Bounds','isSelected':false,'show':false},
              {'name':'Fiber Bounds','isSelected':false,'show':false},
              {'name':'DOCSIS Bounds','isSelected':false,'show':false},
              {'name':'DSL Bounds','isSelected':false,'show':false},
              {'name':'Copper Bounds','isSelected':false,'show':false},
             
      ],
    },
    {'name':'Locations', 'isSelected':true, 'category': 'network',
     'layers':[{'name':'All Locations','isSelected':false,'show':false},
              {'name':'Serviceable Locations','isSelected':false,'show':false},
              {'name':'cnHeat Locations','isSelected':false,'show':false},
              {'name':'Fiber Locations','isSelected':false,'show':false},
              {'name':'Cable Locations','isSelected':false,'show':false},
              {'name':'DSL Locations','isSelected':false,'show':false}, 
              {'name':'Copper Locations','isSelected':false,'show':false}, 
      ],
    },
   

  ];

  

  filterSublayers(show,layers){
    return layers.filter(x => x.show == show);
  }

  userLayers: any;
  allLayers: any = [];

  // placeholder layers array for things like los lines, sector coverage objects, what-if, etc
  analysisLayers: any = [{'name': 'Analysis Layers', 'isSelected': false, 'category': 'analysis',
    'layers': [{'name': 'Qualify APs', 'isSelected': false},
              
         ],
    },
  ];

  //placeholder for qualfiy layers
  qualifyLayers: any = [{'name': "Qualify", 'isSelected':true, 'category': 'qualify',
                        'layers':[//{'name':'New Lead','isSelected':true},
                                {'name':'Qualify Paths','isSelected':true},
                                {'name':'Qualify APs','isSelected':true} 
                                ],
                        }
                      ];

  // layercontrol stuff

  layerControlvisible:boolean = false;

  tileShow = true;
  datasetsShow = true;
  mydataShow = true;

  mapMode: string;
  mapClickmode: string;


  osm:any = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })



  stamenToner:any = tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,

  });

  stamenTerrainBg:any = tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 18,

  });

  stamenTopoRelief:any = tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toposm-color-relief/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    bounds: [[22, -132], [51, -56]],
  });

  esriRelief:any = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxZoom: 13,
  });

  esriWorldImagery:any = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  });

  stamenTonerHybrid:any = tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
  });

  clutterTiles:any = tileLayer.wms('https://services.terrascope.be/wms/v2',{layers: 'WORLDCOVER_2021_MAP', transparent: true, opacity: 0.5});
  clutterTiles30:any = tileLayer.wms('https://www.mrlc.gov/geoserver/mrlc_display/NLCD_2019_Land_Cover_L48/wms',{layers: 'NLCD_2019_Land_Cover_L48', transparent: true, opacity: 0.5});

  evaIcons = [];

  layers = [this.stamenToner];
  layersControl = {
    baseLayers: {
      'Street Map': this.stamenToner,

    },
    overlays: {

    },
  };

  mapState: any = {};

  projData: any = null;

  infowindow = false;
  selectionwindow: boolean = false;
  sitedatatext = '';

  infowindowobj = {};

  streetviewmarker2: any;

  streetviewobjs = [];

  streetviewlines = [];

  objCenter = {};

  drawnItems: FeatureGroup = featureGroup();

  drawOptions = {
    draw : {
      rectangle: {
        shapeOptions: {
          color: '#85bb65',
        },
      },
    },
    edit: {
      featureGroup: this.drawnItems,
    },
  };

  // Map Functions
  getCoords(e:any) {
    this.currentLat = e.latlng.lat.toFixed(5);
    this.currentLon = e.latlng.lng.toFixed(5);
    // console.log(this.currentLat, this.currentLon);
  }

  mapMoveEnd(map: Map) {
    this.mapCenter = this.map.getCenter();
    //GlobalVars.mapCenter = this.mapCenter;
    this.mapState = {'mapCenter': this.map.getCenter(), 'mapZoom': this.map.getZoom()};
    localStorage.setItem('mapState', JSON.stringify(this.mapState));
    // console.log('current center is ' + this.mapCenter);
  }

  mapZoomEnd(map: Map) {
    this.mapZoom = this.map.getZoom();
    //GlobalVars.mapZoom = this.mapZoom;
    this.mapState = {'mapCenter': this.map.getCenter(), 'mapZoom': this.map.getZoom()};
    localStorage.setItem('mapState', JSON.stringify(this.mapState));
  }

  

  constructor(public apiService: ApiService, private router: Router,) { }

  ngOnInit(): void {

  
    this.layerControl = this.basicLayers;

    /* this.locations = this.searchTerms.pipe(
      debounceTime(500),       // wait for 300ms pause in events  
      distinctUntilChanged(),   // ignore if next search term is same as previous  
      switchMap(term => { //term}   // switch to new observable each time 
        if(this.searchtype == 'locations'){
          return this.apiService.locationSearch(this.org_id,term) 
        }
        if(this.searchtype == 'aps'){
          let filteredaps: any = [];
          filteredaps = this.apData.filter(x => x.ap_name.toLowerCase().includes(term.toLowerCase()));
          let faps = [];
          faps.push(filteredaps);
          return faps;
        }
        if(this.searchtype == 'towers'){
          let filteredsites = this.siteData.filter(obj => obj.name.toLowerCase().includes(term.toLowerCase()));
          let fsites = [];
          fsites.push(filteredsites);

            return fsites;

        }
        })


    ); */


    
  }

  //change the search type
  changeSearch(st){
    console.log("changing searchtype " + st);
    this.searchtype = st;
    this.newSearch();
    this.selLocation = '';
  }

  searchAps(term: string): void {  
    this.selFlag = true;  
    this.searchApTerms.next(term);  
  } 
  
  searchTowers(term: string): void {  
    this.selFlag = true;  
    //const test = this.siteData.filter(x => x.name.toLowerCase().includes(term.toLowerCase()));
    //console.log(JSON.stringify(test));
    this.searchTowerTerms.next(term);
    console.log(this.searchTowerTerms);  
  } 

  // Push a search term into the observable stream.  
  searchLocation(term: string): void {  
    this.selFlag = true;  
    this.searchTerms.next(term);  
  }  
  onselectLocation(locObj) {     
    if (this.searchtype == 'locations'){
      if (locObj.location_id != 0) {  
        this.selLocation = locObj.location_id + " - " + locObj.address;       
        this.selFlag = false;  
        this.map.setView(new LatLng(parseFloat(locObj.latitude),parseFloat(locObj.longitude)),19);
      }  
      else {  
        return false;  
      }  
    }
    if (this.searchtype == 'aps'){
      this.selLocation = locObj.ap_name + " Elv: " + locObj.ap_elevation_ft + " Azimuth: " + locObj.azimuth + "BW: " + locObj.beamwidth;        
        this.selFlag = false;  
        this.map.setView(new LatLng(parseFloat(locObj.lat),parseFloat(locObj.lon)),17);
    }
    if (this.searchtype == 'towers'){
      this.selLocation = locObj.name;        
        this.selFlag = false;  
        this.map.setView(new LatLng(parseFloat(locObj.lat),parseFloat(locObj.lon)),17);
    }
  }  

  newSearch(){
    this.selFlag = false;
    //this.locations = null;
  }

  showhideLayer(toplayer,sublayer,showtf){

    this.basicLayers.forEach(function(l){
      if (l.name == toplayer){
        l.layers.forEach(function(sl){
          if (sl.name == sublayer){
            sl.show = showtf;
          }

        })


      }
    })

  }

  getTotalLocations(){
    var self = this;
    console.log('getting total locs');
    this.apiService.getTotalLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        self.totlocs = response.totallocs;
        console.log('total locs ' + self.totlocs);
      }
    })

  }

  getSevicedLocations(){
    var self = this;
    this.apiService.getServicedLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        const locs = response.locations;
        self.wsvccount = locs.length;
        if(locs.length > 0){
          this.showhideLayer('Locations','All Locations',true);
          this.showhideLayer('Locations','Serviceable Locations',true);
        }
        self.serviceLocs = locs;
        //self.createLocationmapobj(locs);
        if (self.map){
          self.createLocationmapobj('wireless');
        }
        return locs;


      }else{

        console.log(JSON.stringify(response.error));
        alert("could not get serviceable locations");
      }

    });


  }


  createcnHeatmapobj() {
    const self = this;
    console.log("creating cnheat map objects");
    const lm = [];
    
    let cnarr = [];
    
    var cnheatLayer = new LayerGroup();
    
    this.cnheatData.forEach(function(cnobj){
      
      //console.log("creating marker from "+ JSON.stringify(leadobj));
      var spopup = "";
      spopup += "<b>Gid: </b>" + cnobj.gid + "</br>";
      spopup += "<b>Max Down: </b>" + cnobj.maxdown+ "</br>";
      spopup += "<b>Max Up: </b>" + cnobj.maxup+ "</br>";
      spopup += "<b>Technology: </b>" + cnobj.technology+ "</br>";
      spopup += "<b>Bizrescode: </b>" + cnobj.bizrescode+ "</br>";


      
      let qLayer: any;
      const geojsonFeature = JSON.parse(cnobj.geojson);
      const qgeo =  geoJSON(geojsonFeature);
         // console.log('added json layer ' + datasetname);
      cnarr.push(qgeo);
    })

    let qLayer: any;
      qLayer = new LayerGroup(cnarr);
      qLayer['name'] = 'cnHeat Polygons';
      self.allOverlays['cnHeat Polygons'] = qLayer;

     

        const foundlayer = false;
        if (foundlayer === false) {
          self.buildLayercontrol('chHeat');
        } else {
          // self.checkLayerVisibility(fLayer);
        }
        return true;

  }
  

  getCnheatServiceTiles() {
    const self = this;
    let tilename = 'bdc_' + this.org_id + "_cnheat";
    //tilename = 'bdc_fabric';
    self.points_layers = [];
    const tileurl = 'https://www.regulatorysolutions.us:7801/bdc_fabric.' + tilename ;
    // get the json for the project
    const tjson = 'https://www.regulatorysolutions.us:7800/bdcfabric.' + tilename + '.json';
    //self.mapClickmode = 'street';

    this.apiService.getTileJson(tilename).subscribe((resp: any) => {

      let geoType = '';
      const tablecols = [];
        if (resp.result === 'success') {
          this.showhideLayer('cnHeat','cnHeat Polygons',true);
          // console.log('tile json ' + JSON.stringify(resp.json));
          geoType = resp.json.geometrytype;
          // console.log('geoType ' + geoType);
          const properties = resp.json.properties;
          resp.json.properties['geoType'] = geoType;
          properties.forEach(function(property) {
            // // console.log('pushing ' + property.name);
            tablecols.push(property.name);

          });


        }

        console.log('building tile layer ' + tilename);
        const renderer = canvas( {padding: 0.5} );

        const vectorTileStyling = {};
        const vectorTileColor = 'green';
        let style = {};

        if (geoType === 'Point') {

          self.points_layers.push(tilename);

          const vstyle = function(properties,zoom) {

            let serviceable = properties.serviceable;
           
            if(!serviceable){
              style = {

                'radius': 5,
                'fill': true,
                'fillColor': 'blue',
                'fillOpacity': 0.5,
                'color': 'blue',
                'opacity': 0.7,
                'weight': 2, 
              }
            }else{
            

              style = {

                'radius': 5,
                'fill': true,
                'fillColor': vectorTileColor,
                'fillOpacity': 0.5,
                'color': vectorTileColor,
                'opacity': 0.7,
                'weight': 2, 
              };
             
            }
            return style;

          }

          vectorTileStyling['bdc_fabric.' + tilename] = vstyle;

          
        }

        vectorTileStyling['bdc_fabric.' + tilename] = {

          'radius': 5,
          'fill': true,
          'fillColor': '#ff0000',
          'fillOpacity': 0.3,
          'color': '#ff0000',
          'opacity': 0.7,
          'weight': 2, 
        };

        if (geoType !== 'Point' && geoType !== 'MultiLineString') {
          vectorTileStyling['bdc_fabric.' + tilename] = {
            'fill': true,
            'fillColor': '#ff0000',
            'fillOpacity': 0.3,
            'color': '#ff0000',
            'opacity': 0.7,
            'weight': 1,
          };
        }

        if (geoType === 'MultiLineString'){
          vectorTileStyling['bdc_fabric.' + tilename] = resp.style;

        }

        if (geoType === '') {

          vectorTileStyling['bdc_fabric.' + tilename] = {
            'fill': true,
            'fillColor': vectorTileColor,
            'fillOpacity': 0.1,
            'color': vectorTileColor,
            'opacity': 0.7,
            'weight': 2,
            'radius': 1,
          };
        }

        const vectorTileOptions = {
          vectorTileLayerStyles: vectorTileStyling,
          renderer: renderer,
          zIndex: 999,
          interactive: true, // Make sure that this VectorGrid fires mouse/pointer events

        };

        const tlayer = vectorGrid.protobuf(tileurl + '/{z}/{x}/{y}.pbf',
          vectorTileOptions,
        ).on('click', function(e) {
          //console.log('e ' , e);
          let popup = '';
            let pt;
            if(e.target.layers){
              pt = e.target.layers.properties;

            }else{
              pt = e.layer.properties;

            }
            
            if(geoType == 'Point'){
                popup += '<p><b>Location ID: ' + pt['location_id'] + '</br>' + 'Address: ' + pt['address_primary'] + '</br>' ;
                
                const lat = Number(pt['latitude']);
                  const lon = Number(pt['longitude']);
                  const ltln = latLng(lat,lon);
                  const pup = new Popup().setLatLng(ltln);
                  pup.setContent(popup);
                  self.tilelayerPopup = pup;
                  e.sourceTarget.bindPopup(pup);
                  self.map.openPopup(self.tilelayerPopup);
                  tlayer['name'] = 'Locations'; //tilename;
        
                  self.points_tile_layers.push(tlayer);
        
            }
            if(geoType == 'MultiPolygon'){
                console.log('pt ' + JSON.stringify(pt))
                const pup = new Popup();
                pup.setContent("cnHeat Layer")           
                e.target.bindPopup(pup)
                self.map.openPopup(self.tilelayerPopup);
                tlayer['name'] = 'cnHeat Polygons';

            }
          /* L.popup()
          .setContent(self.createPopupContent(e.target.name, e.layer.properties, tablecols))
          .setLatLng(e.latlng)
          .openOn(self.map) */
          })
         /*  .on('mouseover', function(e){
            //console.log('e ' , e);
            L.popup()
            .setContent("<b>Location_ID: " +e.layer.properties.location_id + "</b>")
            .setLatLng(e.latlng)
            .openOn(self.map) 
            
          })
          .on('mouseout', function(e){
            //self.map.closePopup();
            e.sourceTarget.closePopup();
            e.target.closePopup();
          }); */

        
        /* self.allLayers.forEach(function(layer) {
          if (layer.name === tilename) {
            layer['columns'] = tablecols;
          }
        }); */

        self.allOverlays['cnHeat Polygons'] =  tlayer;

        const foundlayer = false;
        if (foundlayer === false) {
          self.buildLayercontrol('chHeat');
        } else {
          // self.checkLayerVisibility(fLayer);
        }
        return true;
    });
  }

  getFiberSevicedLocations(){
    var self = this;
    this.apiService.getFiberServicedLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        const locs = response.locations;
        if (locs.length > 0){
          this.showhideLayer('Locations','Fiber Locations',true);
        }
        self.fiberserviceLocs = locs;
        //self.createLocationmapobj(locs);
        if (self.map){
          self.createLocationmapobj('fiber');
        }
        return locs;


      }else{

        console.log(JSON.stringify(response.error));
        //alert("could not get fiber serviceable locations");
      }

    });


  }

  getCableSevicedLocations(){
    var self = this;
    this.apiService.getCableServicedLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        const locs = response.locations;
        self.cableserviceLocs = locs;
        if (locs.length > 0){
          this.showhideLayer('Locations','Cable Locations',true);
        }
        //self.createLocationmapobj(locs);
        if (self.map){
          self.createLocationmapobj('cable');
        }
        return locs;


      }else{

        console.log(JSON.stringify(response.error));
        //alert("could not get cable serviceable locations");
      }

    });


  }

  getDslSevicedLocations(){
    var self = this;
    this.apiService.getDslServicedLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        const locs = response.locations;
        self.dslserviceLocs = locs;
        if (locs.length > 0){
          this.showhideLayer('Locations','DSL Locations',true);
        }
        //self.createLocationmapobj(locs);
        if (self.map){
          self.createLocationmapobj('dsl');
        }
        return locs;


      }else{

        console.log(JSON.stringify(response.error));
        //alert("could not get dsl serviceable locations");
      }

    });


  }

  getCopperSevicedLocations(){
    var self = this;
    this.apiService.getDslServicedLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        const locs = response.locations;
        self.copperserviceLocs = locs;
        if (locs.length > 0){
          this.showhideLayer('Locations','Copper Locations',true);
        }
        //self.createLocationmapobj(locs);
        if (self.map){
          self.createLocationmapobj('copper');
        }
        return locs;


      }else{

        console.log(JSON.stringify(response.error));
        //alert("could not get dls serviceable locations");
      }

    });


  }

  getcnheatSevicedLocations(){
    var self = this;
    this.apiService.getcnheatServicedLocations(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        const locs = response.locations;
        self.cnheatserviceLocs = locs;
        if (locs.length > 0){
          this.showhideLayer('Locations','cnHeat Locations',true);
        }
        self.getCnheatServiceTiles();
        //self.getcnHeatraw()
        
        if (self.map){
          self.createLocationmapobj('cnheat');
        }
        return locs;


      }else{

        console.log(JSON.stringify(response.error));
        //alert("could not get cnheat serviceable locations");
      }

    });


  }

  getcnHeatraw(){
    const self = this;
    this.apiService.getcnHeatraw(this.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        self.cnheatData = response.data;
        self.createcnHeatmapobj();
      }else{
          console.log(JSON.stringify(response.error))

      }
    })


  }

  pe_approve(){
    const self = this;
    this.apiService.pe_approve(this.org_id, this.period_end).subscribe((response: any) =>{
      if (response.result == 'success'){
        alert('Org set to PE approved');
        self.pe_approved = true;
      }else{
          console.log(JSON.stringify(response.error))
          alert('Error setting to approved ' + response.error);
      }
    })


  }

  getSites(){
    const self = this;
    this.apiService.getAdminSites(self.org_id).subscribe((response:any) =>{
      //console.log(data);
      if (response.result == 'success'){
        var rsites = response.data;
        self.siteData = [];
        rsites.forEach(function(site){
          var md = site.metadata;
          
          if (md.length > 0){
            md.forEach(function(d){
              if (d.field == 'state'){
                site["state"] = d.value;
              }
              if (d.field == 'site_type'){
                site["site_type"] = d.value;
              }
            })

          } 
          self.siteData.push(site);

        })

          // var sites = this.createSitesmapobj();
          if(self.map){
            console.log("map is here creating site objs")
            this.createSitesmapobj();
          }
          return self.siteData;

      }else{

        console.log("error getting sites");
      }
    });


  }


  createLocationmapobj(type){
    const self = this;
    let locationLayer = new LayerGroup();
    let dataobjs;
    let color = '#00ff00';
    if(type == 'wireless'){
      dataobjs = self.serviceLocs;
    }
    if(type == 'fiber'){
      color = '#0000ff';
      dataobjs = self.fiberserviceLocs;
    }
    if(type == 'cable'){
      color = '#ff00ff';
      dataobjs = self.cableserviceLocs;
    }
    if(type == 'dsl'){
      color = '#aabbcc';
      dataobjs = self.dslserviceLocs;
    }
    if(type == 'copper'){
      color = '#c2c2c2';
      dataobjs = self.dslserviceLocs;
    }
    if(type == 'cnheat'){
      color = '#ff00ff';
      dataobjs = self.cnheatserviceLocs;
    }



    let qMarkers = [];

    dataobjs.forEach(function(dobj) {

      // console.log('creating marker from '+ JSON.stringify(leadobj));
      var popup = '';
      if (dobj['location'] && dobj['location'] != '') {
        popup += '<b>Location: ' + dobj['location'] + '</br>';
      }
      popup += '<b>Address: </b>' + dobj.address_primary +  '</br>';
      /* if (dobj['Site Address2'] && dobj['Site Address2'] != '') {
        popup += dobj['Site Address2'] + '</br>';
      } */
      popup += dobj.city + ', ' + dobj.state + ' ' + dobj.zip + '</br>';

      if(type == 'wireless'){
        popup += '<b>Best AP: </b>' + dobj.best_ap + '<br>Distance: ' + dobj.distance + '</br>Bearing: ' + dobj.bearing;
      }else{
        popup += "<b>Served By:</b> " + type;

      }

      //popup += '</br><a href="#" (click)="self.showQualified('+dobj.location+')">Show Results</a>';
      //popup += '</br><span style="color: #00ff00" id="showProfs">Show Results</span>';
      
      var lat = Number(dobj.latitude);
      var lon = Number(dobj.longitude);
      var marker;
      if (!lat || !lon ) {
        // // console.log(JSON.stringify(dobj));
        // console.log(dobj['Site Name'] + ' had no coords');s
        var geojson = JSON.parse(dobj.geojson);
        lat = geojson.coordinates[1];
        lon = geojson.coordinates[0];
      }
      
      if (dobj.serviceable == true && dobj.best_ap == 0){
        marker = circleMarker([lat, lon],{fill: true, fillColor: color,radius: 4,
          stroke:true, color:'#006600', fillOpacity:0.70,pane: 'locations'});
      }else{
      
        marker = circleMarker([lat, lon],{fill: true, fillColor: color,radius: 3,
        stroke:false, fillOpacity:0.70,pane: 'locations'});
      } 
          
        marker["name"] = dobj.location_id;
        marker.on('click', function(e) {
          if (type == 'wireless'){
            self.showQualified(dobj,'all','serviceable');
          }
        });
        
        //.bindPopup(popup)
        
       
        qMarkers.push(marker);
       
    });

    var locationsLayer = new LayerGroup(qMarkers);
    if(type == 'wireless'){
      locationsLayer['name'] = "Serviceable Locations";
      this.allOverlays["Serviceable Locations"] = locationsLayer;
    }
    if(type == 'fiber'){
      locationsLayer['name'] = "Fiber Locations";
      this.allOverlays["Fiber Locations"] = locationsLayer;
    }
    if(type == 'cable'){
      locationsLayer['name'] = "Cable Locations";
      this.allOverlays["Cable Locations"] = locationsLayer;
    }
    if(type == 'dsl'){
      locationsLayer['name'] = "DSL Locations";
      this.allOverlays["DSL Locations"] = locationsLayer;
    }
    if(type == 'copper'){
      locationsLayer['name'] = "Copper Locations";
      this.allOverlays["Copper Locations"] = locationsLayer;
    }
    if(type == 'cnheat'){
      locationsLayer['name'] = "cnHeat Locations";
      this.allOverlays["cnHeat Locations"] = locationsLayer;
    }


    //locationsLayer.setZIndex(1000);

    //this.allOverlays["Serviceable Locations"] = locationsLayer;
    

    this.buildLayercontrol("Locations");
    return true;


  }

  showLocationPopup(){


  }

  createSitesmapobj() {
    
    console.log("creating site map objects");
    //this.leadMarkers = [];
    const lm = [];
    const self = this;
    let sitesarr = [];
    let activeLayer = new LayerGroup();
    /* var proposedLayer = new L.LayerGroup();
    var inactiveLayer = new L.LayerGroup(); */

    const towerIcon = icon({iconUrl: 'https://app.regulatorysolutions.us/assets/images/tower.png', iconSize: [23,30], iconAnchor: [11,25]});
    const activeIcon = icon({iconUrl: 'https://app.regulatorysolutions.us/assets/images/tower.png', iconSize: [23,30], iconAnchor: [11,25]});
   /*  var inactiveIcon = L.icon({iconUrl: '/assets/images/inactiveTower.png', iconSize: [23,30], iconAnchor: [25,25]});
    var leadIcon = L.icon({iconUrl: '/assets/images/leadTower.png', iconSize: [23,30], iconAnchor: [25,25]}); */
    
    //var activesiteLayer = new L.LayerGroup(this.activeSites);
    //var inactivesiteLayer = new L.LayerGroup(this.inactiveSites);
    //var proposedsiteLayer = new L.LayerGroup(this.proposedSites);


    this.siteData.forEach(function(siteobj){
      
      //console.log("creating marker from "+ JSON.stringify(leadobj));
      let popup = "";
      popup += "<b>Name: </b>" + siteobj.name + "</br><b>Position: </b></br>" + siteobj.lat + ", "+ siteobj.lon + "</br>";
      popup += "<b>Elevation: </b>" + siteobj.max_elevation+ "</br>";
      popup += "<b>Type: </b>" + siteobj.site_type+ "</br>";
      //popup += "<b>Status: </b>" + siteobj.status;
      const lat = Number(siteobj.lat);
      const lon = Number(siteobj.lon);
      //var marker = L.marker([lat,lon]).bindPopup(popup);

      const ltln = latLng(lat,lon);
      const pup = new Popup({closeButton:false,closeOnEscapeKey:true}).setLatLng(ltln);
      pup.setContent(popup);
      
      let sitemarker = marker(new LatLng(lat,lon),{icon:towerIcon}).bindPopup(pup);
      //if (!siteobj.status || siteobj.status == ""){
        
        //sitemarker = marker([lat,lon]).bindPopup(popup);
        
        self.activeSites.push(sitemarker);
        sitesarr.push(sitemarker);        
         // //siteobj.markerid = activesiteLayer.getLayerId(marker);
     // }
      /* if (siteobj.status == "Active"){
        
        marker = L.marker([lat,lon],{icon:activeIcon}).bindPopup(popup);
        
        self.activeSites.push(marker);
       
        //siteobj.markerid = activesiteLayer.getLayerId(marker);
        //console.log("markerid " + siteobj.markerid);
        
      }
      if (siteobj.status == "Inactive"){
        
        marker = L.marker([lat,lon],{icon:inactiveIcon}).bindPopup(popup);
       
        self.inactiveSites.push(marker);
        //siteobj.markerid = inactivesiteLayer.getLayerId(marker);
        
      }
      if (siteobj.status == "Proposed"){
        
        marker = L.marker([lat,lon],{icon:leadIcon}).bindPopup(popup);
       
        self.proposedSites.push(marker);
        //siteobj.markerid = proposedsiteLayer.getLayerId(marker);
        
      } */
      siteobj.marker = sitemarker;
      //siteobj.markerid = marker._leaflet_id;
      //self.layers.push(marker);
      //console.log(siteobj.markerid, marker._latlng);

    })

    activeLayer = new LayerGroup(sitesarr);
    activeLayer['name'] = "Active Sites";
    self.allOverlays['Active Sites'] = activeLayer;
    
    /* var inactivesiteLayer = new L.LayerGroup(this.inactiveSites);
    inactivesiteLayer['name'] = "Inactive Sites";
    this.allOverlays["Inactive Sites"] = inactivesiteLayer;

    var proposedsiteLayer = new L.LayerGroup(this.proposedSites);
    proposedsiteLayer['name'] = "Proposed Sites";
    this.allOverlays["Proposed Sites"] = proposedsiteLayer; */
    
    /* this.siteData.forEach(function(s){
      var mkid = s.marker._leaflet_id;
      s.markerid = mkid;
      console.log(s.id, s.markerid);
    }) */
    self.buildLayercontrol("Sites");
    //self.findCenter(this.siteData);
    return true;
    
  }

  getRandomColor() {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }


 getAPs() {
    const self = this;
    this.apiService.getAdminAps(self.org_id).subscribe((result: any) =>{
      //console.log(data);
      if (result.result == 'success'){
        var aps = result.data;
       // var aps = self.createAPsmapobj(); 
        self.apData = aps;
        let freqs = [...new Set(self.apData.map(item => item.frequency_mhz))];
        freqs.forEach(function(f){
          let fcolor = self.getRandomColor();
          self.frequency_colors.push({"frequency":f,"color":fcolor});
        })

        self.apData.forEach(function(apobj){
          let apfreq = apobj.frequency_mhz;
          self.frequency_colors.forEach(function(fc){
            if (apfreq == fc.frequency){
              apobj["color"] = fc.color;

            }
          })


        })
        

        if (self.map){
          console.log("map is here creating AP objs")
          this.createAPsmapobj();
        }  
        return aps;
      }else{
        alert('Error fetching APs ' + result.errro);

      }
    })  

    

  }

  createAPsmapobj() {
    const self = this;
    console.log("creating AP map objects");
    const lm = [];
    
    let apsarr = [];
    let radapsarr:any = [];
    let activeapLayer = new LayerGroup();

 
    /* var inactiveapLayer = new L.LayerGroup();
    var proposedapLayer = new L.LayerGroup();*/

    let activeFreqLayer = new LayerGroup();
    //var proposedFreqLayer = new L.LayerGroup(); 

           
    this.apData.forEach(function(apobj){
      
      //console.log("creating marker from "+ JSON.stringify(leadobj));
      var spopup = "";
      spopup += "<b>Name: </b>" + apobj.ap_name + "</br><b>Position: </b></br>" + apobj.lat + ", "+ apobj.lon + "</br>";
      spopup += "<b>Elevation: </b>" + apobj.ap_elevation_ft+ "</br>";
      spopup += "<b>Azimuth: </b>" + apobj.azimuth+ "</br>";
      spopup += "<b>Beamwidth: </b>" + apobj.beamwidth+ "</br>";
      spopup += "<b>Frequency: </b>" + apobj.frequency_mhz+ "</br>";
      spopup += "<b>Channel Width: </b>" + apobj.channel_width_mhz + "</br>";
      //spopup += "<b>IP: </b>" + apobj.ip_address;
      //spopup += "<b>Status: </b>" + apobj.Status;
      var lat = Number(apobj.lat);
      var lon = Number(apobj.lon);
      var shapellarr:any =self.apiService.sectorShapes(apobj,1,null);
      var shaperadarr:any = self.apiService.sectorShapes(apobj,0,null);

      apsarr.push(shapellarr);
      radapsarr.push(shaperadarr);
      var apcolor = apobj["color"]; //'#00ff00';
       
        //console.log("got back " + JSON.stringify(shaperadarr));
        var poly = polygon(shapellarr, {color:apcolor, fillColor: apcolor, fill: true, stroke:true,opacity: 0.85});
        var radpoly = polygon(shaperadarr, {color:apcolor, fillColor: apcolor, fill: true, stroke:true,opacity: 0.85});
        const ltln = latLng(lat,lon);
        const pup = new Popup({closeButton:false,closeOnEscapeKey:true}).setLatLng(ltln);
        pup.setContent(spopup);
        poly.bindPopup(pup);
        radpoly.bindPopup(pup);

        //if(apobj.Status == 'Active'){
          poly.addTo(activeapLayer);
          radpoly.addTo(activeFreqLayer);
          self.activeapShapes.push(poly);
          self.activefreqRad.push(radpoly);
        //}
       /*  if(apobj.Status == 'Inactive'){
          poly.addTo(inactiveapLayer);
          self.inactiveapShapes.push(poly);
        }
        if(apobj.Status == 'Proposed'){
          poly.addTo(proposedapLayer);
          radpoly.addTo(proposedFreqLayer);
          self.proposedapShapes.push(poly);
          self.proposedfreqRad.push(poly);
        } */

      
      

    })

    console.log(radapsarr);
    
    activeapLayer = new LayerGroup(this.activeapShapes);
    activeFreqLayer = new LayerGroup(this.activefreqRad);
    activeapLayer['name'] = "Active APs";
    activeFreqLayer['name'] = "AP Frequency";
    this.allOverlays["Active APs"] = activeapLayer;
    this.allOverlays["AP Frequency"] = activeFreqLayer;

    /* var inactiveapeLayer = new L.LayerGroup(this.inactiveapShapes);
    inactiveapLayer['name'] = "Inactive APs";
    this.allOverlays["Inactive APs"] = inactiveapLayer;

    var proposedapLayer = new L.LayerGroup(this.proposedapShapes);
    var proposedRadLayer = new L.LayerGroup(this.proposedapRad);
    proposedapLayer['name'] = "Proposed APs";
    proposedFreqLayer['name'] = "Basic Radius - Proposed";
    this.allOverlays["Proposed APs"] = proposedapLayer;
    this.allOverlays["Proposed - by rad"] = proposedFreqLayer; */

    this.buildLayercontrol("APs");
    
    //this.layersControl.overlays.APs = apLayer;
    return true;
  }

  getFilerinfo(){
    const self = this;
    this.apiService.getAdminFilerInfo(this.org_id).subscribe((result: any) =>{
      if (result.result == 'success'){
        const filer = result.data;
        self.filer = filer;
        if ((filer.filing_fixed_unlicensed_wireless || filer.filing_fixed_licensed_wireless)){
          self.getNetworkBounds();
        }
        if(filer.filing_fiber){
          self.getAdminFiberBounds();
        }
        if(filer.filing_dsl_copper){
          self.getAdminDslBounds()
        }
        if(filer.filing_cable){
          self.getAdminCableBounds()
        }
        

       
      }else{
        alert('Error fetching Network Bounds ' + result.errro);

      }


    })
  }

  getAdminFiberBounds(){
    const self = this;
    this.apiService.getAdminFiberBounds(this.org_id).subscribe((result: any) =>{
      //console.log(data);
      if (result.result == 'success'){
        const bData = result.data[0];
        self.fiberboundsData = bData;
        
        this.showhideLayer('Network Boundaries','Fiber Bounds',true);
        
        if(self.map){
          console.log("map is here creating fiber bounds objs");
          self.buildBoundsLayers('fiber');
        }
        

       
      }else{
        alert('Error fetching Fiber Bounds ' + result.errro);

      }
    })  

  }

  getAdminCableBounds(){
    const self = this;
    this.apiService.getAdminCableBounds(this.org_id).subscribe((result: any) =>{
      //console.log(data);
      if (result.result == 'success'){
        const bData = result.data[0];
        self.cableboundsData = bData;
        this.showhideLayer('Network Boundaries','Cable Bounds',true);
        if(self.map){
          console.log("map is here creating cable bounds objs");
          self.buildBoundsLayers('docsis');
        }
        

       
      }else{
        alert('Error fetching Fiber Bounds ' + result.errro);

      }
    })

  }

  getAdminDslBounds(){
    const self = this;
    this.apiService.getAdminDslBounds(this.org_id).subscribe((result: any) =>{
      //console.log(data);
      if (result.result == 'success'){
        const bData = result.data[0];
        self.dslboundsData = bData;
        this.showhideLayer('Network Boundaries','DLS Bounds',true);
        if(self.map){
          console.log("map is here creating DSL bounds objs");
          self.buildBoundsLayers('dsl');
        }
        

       
      }else{
        alert('Error fetching Fiber Bounds ' + result.errro);

      }
    })

    this.apiService.getAdminCopperBounds(this.org_id).subscribe((result: any) =>{
      //console.log(data);
      if (result.result == 'success'){
        const bData = result.data;
        self.copperboundsData = bData[0];
        this.showhideLayer('Network Boundaries','Copper Bounds',true);
        if(self.map){
          console.log("map is here creating copper bounds objs");
          self.buildBoundsLayers('copper');
        }
        

       
      }else{
        alert('Error fetching Fiber Bounds ' + result.errro);

      }
    })


  }


  getNetworkBounds(){
    const self = this;
    this.apiService.getAdminNetworkBounds(this.org_id).subscribe((result: any) =>{
      //console.log(data);
      if (result.result == 'success'){
        const bData = result.data;
        self.boundsData = bData;
        if(self.map){
          console.log("map is here creating wireless bounds objs");
          this.showhideLayer('Network Boundaries','Wireless Bounds',true);
          self.buildBoundsLayers('wireless');
          if (self.filer.filing_fixed_licensed_wireless){
            this.showhideLayer('Network Boundaries','Licensed Bounds',true);
            self.buildBoundsLayers('licensed');
          }
          if (self.filer.filing_fixed_unlicensed_wireless){
            this.showhideLayer('Network Boundaries','Unlicensed Bounds',true);
            self.buildBoundsLayers('unlicensed');
          }

        }
        return bData;

       
      }else{
        alert('Error fetching Network Bounds ' + result.errro);

      }
    })  

  }


  buildBoundsLayers(ltype){
    const self = this;
    const qShapes = [];
    const netbndsarr = [];
    const renderer = canvas({padding: 0.5});
    let layerdata: any;

    //self.boundsData.forEach(function(layerdata){
      let datasetname = '';
      if (ltype == "wireless"){
        
          datasetname = 'Wireless Bounds';
          self.boundsData.forEach(function(wl){
            if(wl.name == 'wireless'){
              layerdata = wl;
            }
          })
          
      }
      if(ltype == 'licensed'){
        datasetname = 'Licensed Bounds';
        
        self.boundsData.forEach(function(wl){
          if(wl.name == 'licensed'){
            layerdata = wl;
          }
        })
      }
      if(ltype == 'unlicensed'){
        datasetname = 'Unlicensed Bounds';
        self.boundsData.forEach(function(wl){
          if(wl.name == 'unlicensed'){
            layerdata = wl;
          }
        })
      }
      if(ltype == 'fiber'){
        
        datasetname = 'Fiber Bounds';
        layerdata = self.fiberboundsData;
      }
      if(ltype == 'docsis'){
        
        datasetname = 'Docsis Bounds';
        layerdata = self.cableboundsData;
      }
      if(ltype == 'dsl'){
        
        datasetname = 'DSL Bounds';
        layerdata = self.dslboundsData;
      }

      if(ltype == 'copper'){
        
        datasetname = 'Copper Bounds';
        layerdata = self.copperboundsData;
      }

      
        
        let qLayer: any;
        if (!(layerdata === undefined)){
          const geojsonFeature = JSON.parse(layerdata.geojson);
          const qgeo =  geoJSON(geojsonFeature);
          // console.log('added json layer ' + datasetname);
          qShapes.push(qgeo);
          qLayer = new LayerGroup(qShapes);
          qLayer['name'] = datasetname;
          self.allOverlays[datasetname] = qLayer;
        }


    //})
    //self.buildLayercontrol('Network Boundaries');
    
      self.buildLayercontrol('Network Boundaries');
    


  }

  buildTileLayer() {
    const self = this;
    let tilename = 'bdc_' + this.org_id;
    //tilename = 'bdc_fabric';
    self.points_layers = [];
    const tileurl = 'https://www.regulatorysolutions.us:7801/bdc_fabric.' + tilename ;
    // get the json for the project
    const tjson = 'https://www.regulatorysolutions.us:7800/bdcfabric.' + tilename + '.json';
    self.mapClickmode = 'street';

    this.apiService.getTileJson(tilename).subscribe((resp: any) => {

      let geoType = '';
      const tablecols = [];
        if (resp.result === 'success') {
          this.showhideLayer('Locations','All Locations',true);
          // console.log('tile json ' + JSON.stringify(resp.json));
          geoType = resp.json.geometrytype;
          // console.log('geoType ' + geoType);
          const properties = resp.json.properties;
          resp.json.properties['geoType'] = geoType;
          properties.forEach(function(property) {
            // // console.log('pushing ' + property.name);
            tablecols.push(property.name);

          });


        }

        console.log('building tile layer ' + tilename);
        const renderer = canvas( {padding: 0.5} );

        const vectorTileStyling = {};
        const vectorTileColor = 'red';
        let style = {};

        if (geoType === 'Point') {

          self.points_layers.push(tilename);

          const vstyle = function(properties,zoom) {

            let serviceable = properties.serviceable;
           
            if(!serviceable){
              style = {

                'radius': 3,
                'fill': true,
                'fillColor': 'blue',
                'fillOpacity': 0.5,
                'color': 'blue',
                'opacity': 0.7,
                'weight': 2, 
              }
            }else{
            

              style = {

                'radius': 3,
                'fill': true,
                'fillColor': vectorTileColor,
                'fillOpacity': 0.5,
                'color': vectorTileColor,
                'opacity': 0.7,
                'weight': 2, 
              };
             
            }
            return style;

          }

          vectorTileStyling['bdc_fabric.' + tilename] = vstyle;

          
        }

        vectorTileStyling['bdc_fabric.' + tilename] = {

          'radius': 3,
          'fill': true,
          'fillColor': vectorTileColor,
          'fillOpacity': 0.5,
          'color': vectorTileColor,
          'opacity': 0.7,
          'weight': 2, 
        };

        if (geoType !== 'Point' && geoType !== 'MultiLineString') {
          vectorTileStyling['bdc_fabric.' + tilename] = {
            'fill': true,
            'fillColor': vectorTileColor,
            'fillOpacity': 0.5,
            'color': vectorTileColor,
            'opacity': 0.7,
            'weight': 2,
          };
        }

        if (geoType === 'MultiLineString'){
          vectorTileStyling['bdc_fabric.' + tilename] = resp.style;

        }

        if (geoType === '') {

          vectorTileStyling['bdc_fabric.' + tilename] = {
            'fill': true,
            'fillColor': vectorTileColor,
            'fillOpacity': 0.1,
            'color': vectorTileColor,
            'opacity': 0.7,
            'weight': 2,
            'radius': 1,
          };
        }

        const vectorTileOptions = {
          vectorTileLayerStyles: vectorTileStyling,
          renderer: renderer,
          zIndex: 1000,
          interactive: true, // Make sure that this VectorGrid fires mouse/pointer events

        };

        const tlayer = vectorGrid.protobuf(tileurl + '/{z}/{x}/{y}.pbf',
          vectorTileOptions,
        ).on('click', function(e) {
          //console.log('e ' , e);
          let popup = '';
            let pt;
            if(e.target.layers){
              pt = e.target.layers.properties;

            }else{
              pt = e.layer.properties;

            }
            popup += '<p><b>Location ID: ' + pt['location_id'] + '</br>' + 'Address: ' + pt['address_primary'] + '</br><br><span id="qualbtn" style="color: blue">Qualify</a>' ;
            const lat = Number(pt['latitude']);
              const lon = Number(pt['longitude']);
              const ltln = new LatLng(lat,lon);
              const pup = new Popup({closeButton:false,closeOnEscapeKey:true}).setLatLng(ltln);
              pup.setContent(popup);
              self.tilelayerPopup = pup;
              e.sourceTarget.bindPopup(pup);
              self.map.openPopup(self.tilelayerPopup);
              const qualbutton =  DomUtil.get('qualbtn');
              DomEvent.addListener(qualbutton, 'click', (ee) => {
                console.log("clicked qualify")
                self.showQualified(pt,'all','bdc');
                });

          /* L.popup()
          .setContent(self.createPopupContent(e.target.name, e.layer.properties, tablecols))
          .setLatLng(e.latlng)
          .openOn(self.map) */
          })
         /*  .on('mouseover', function(e){
            //console.log('e ' , e);
            L.popup()
            .setContent("<b>Location_ID: " +e.layer.properties.location_id + "</b>")
            .setLatLng(e.latlng)
            .openOn(self.map) 
            
          })
          .on('mouseout', function(e){
            //self.map.closePopup();
            e.sourceTarget.closePopup();
            e.target.closePopup();
          }); */

        tlayer['name'] = 'All Locations'; //tilename;
        if (geoType === 'Point') {
          self.points_tile_layers.push(tlayer);
        }
        /* self.allLayers.forEach(function(layer) {
          if (layer.name === tilename) {
            layer['columns'] = tablecols;
          }
        }); */

        self.allOverlays['All Locations'] =  tlayer;

        const foundlayer = false;
        if (foundlayer === false) {
          self.buildLayercontrol('All Locations');
        } else {
          // self.checkLayerVisibility(fLayer);
        }
        return true;
    });
  }


  showQualified(dobj,type,layer){
    const self= this;
    self.removeQualobjs();
    self.qualprofs = [];
    const loc = dobj.location_id;
    const loclat = dobj.latitude;
    const loclon = dobj.longitude;
    let qualAps;
    
    self.locAps = this.apiService.findAPslocal(loclat,loclon,self.apData);
    self.locAps.forEach(function(ap){
      ap.geom = '';
    })


    this.apiService.getPathprofiles(self.org_id,self.locAps,loclat,loclon,23,10,loc).subscribe((response:any) => {
      if(response.result == 'success'){
        var approfs = JSON.parse(response.profiles);
        console.log('profiles' + approfs);
        this.qualified = true
        this.chtdata = [];
        var prfcnt =0;
        this.showGraphs = true;
        this.graphsMin = false;
        this.showQualfrm = false;
        self.bestApId = null;
        let tempqualprofs = [];
        //get the best AP
        this.apiService.getLocationAps(self.org_id,loc).subscribe((response: any) =>{
          if(response.result == 'success'){
            let bestap;
            self.bestAp = null;
            if (response.aps.length > 0){
              bestap = response.aps[0];
              self.bestAp = bestap;
              if (bestap){
                self.bestApId = bestap.id;
              }
            }
            let bestaparr = [];
            approfs.forEach(function(ap){
              console.log(JSON.stringify(ap));
              var gdata:any = [];
              var profarray = ap.profile;
              var apname = ap.ap_name;
              var freq = ap.frequency_mhz;
              ap.distance = Number(ap.distance).toFixed(2);
              ap.bearing = Number(ap.bearing).toFixed(2);
              var apid = ap.id; 
              var title = "Profile from " + apname + " (" + freq + " MHz) \nDistance: " + ap.distance + "   Bearing: " +  ap.bearing + " deg";
              var shortTitle = apname + " (" + freq + " MHz) " + ap.distance + " " +  ap.bearing;
              ap.title = title;
              ap.shortTitle = shortTitle;
              ap.showGraph = true;
              if (ap.id == self.bestApId){
                ap.color = '#00ff00';
                //bestaparr.push(ap);
              }
              if (ap.id == self.bestApId || layer == 'bdc'){
                bestaparr.push(ap);
                console.log(ap.color);

                let apTput = ap.throughputs;
                console.log("ap Throughputs " + JSON.stringify(apTput))
                let aptputstr = 'Troughput Tiers<br>';
                apTput.forEach(function(t){
                  aptputstr += t.download + "/" + t.upload + " Mbps @ " + t.min_rx_sig + " dB<br>";
                })
                ap["tputs"] = aptputstr;
                let gco = {
                  colors: ['#8B4513', '#00ff00', '#0000ff', '#ff00ff', ap.color],
                  crosshair: {trigger: 'both',orientation: 'vertical'},
                  selectionMode: 'multiple',
                  focusTarget: 'category',
                  legend: {position: 'bottom'},
                  vAxis: {title: 'Elevation'},
                  hAxis: {title: 'Distance'},
                  seriesType: 'line',
                  series: {0: {type: 'area'},
                          1: {type: 'area'}
                          },
                  
                };
                
                console.log(gco);
                ap["gchtoptions"] = gco;
                console.log(ap.gchtoptions);
                profarray.forEach(function(profpt){
                  gdata.push([profpt.distance,Number(profpt.terrain),Number(profpt.clutter),Number(profpt.freznel),Number(profpt.freznel_60),Number(profpt.los)]);
                })
                ap.gchtdata = gdata;
                prfcnt++;
                if (ap.id == self.bestApId){
                  self.bestAp = ap;
                }
                self.qualprofs.push(ap);
              }
            })
            self.qualprofs.sort((a, b) => a.distance.localeCompare(b.distance));

            const foundIdx = self.qualprofs.findIndex(el => el == self.bestAp);
            if (foundIdx > -1){
              self.qualprofs.splice(foundIdx,1);
              self.qualprofs.unshift(self.bestAp);
            }
            console.log(JSON.stringify(self.qualprofs));
            self.createAPqualobj(approfs,loc,loclat,loclon);
            self.createAPqualobj(bestaparr,loc,loclat,loclon);
          }else{

            console.log("error getting best ap");
          }
        })


      }else{
        console.log(JSON.stringify(response.error));
        alert("could not get APs for location")
      }

    })


    /* if(type == 'serviced'){
      self.bestApId = dobj.best_ap;
    
      this.apiService.getLocationAps(self.org_id,loc).subscribe((response: any) =>{
        if(response.result == 'success'){
          this.qualified = true;
          this.chtdata = [];
          var prfcnt =0;
          this.showGraphs = true;
          this.graphsMin = false;
          this.showQualfrm = false;

          const aps = response.aps;
          aps.forEach(function(ap){
            console.log(JSON.stringify(ap));
            var gdata:any = [];
            var profarray = ap.profile;
            var apname = ap.ap_name;
            var freq = ap.frequency_mhz;
            ap.distance = Number(ap.distance).toFixed(2);
            ap.bearing = Number(ap.bearing).toFixed(2);
            var apid = ap.id; 
            var title = "Profile from " + apname + " (" + freq + " MHz) \nDistance: " + ap.distance + "   Bearing: " +  ap.bearing + " deg";
            var shortTitle = apname + " (" + freq + " MHz) " + ap.distance + " " +  ap.bearing;
            ap.title = title;
            ap.shortTitle = shortTitle;
            ap.showGraph = true;
            profarray.forEach(function(profpt){
              gdata.push([profpt.distance,profpt.terrain,profpt.clutter,profpt.freznel,profpt.freznel_60,profpt.los]);
            })
            prfcnt++;
            ap.gchtdata = gdata;
            self.qualprofs.push(ap);
          })
          self.createAPqualobj(aps,loc,loclat,loclon);
        }else{
          console.log(JSON.stringify(response.error));
          alert("could not get APs for location")
        }

      })
    } */


  }

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  createAPqualobj(aps,loc,loclat,loclon) {

    var self = this;
    //remove all layers
    this.removeQualobjs();
    this.qualShow = true;
     
    aps.forEach(function(apobj){
      var lttbearing;
      if(apobj.bearing < 0 ){
        var b = 360 - (-apobj.bearing);
        lttbearing = 360 - b;
        apobj.bearing = b;
      }else{
        lttbearing = 360 - apobj.bearing;
      }
      
      //console.log("creating marker from "+ JSON.stringify(leadobj));
      var spopup = "<b>AP for Location ID " + loc + "</b></br>";
      spopup += "<b>Name: </b>" + apobj.ap_name+ "</br><b>Position: </b></br>" + apobj.lat + ", "+ apobj.lon + "</br>";
      spopup += "<b>Elevation: </b>" + apobj.ap_elevation_ft+ " ft</br>";
      spopup += "<b>Distance (from AP): </b>" + Number(apobj.distance).toFixed(2)+ " km</br>";
      spopup += "<b>Bearing (from AP): </b>" + Number(apobj.bearing).toFixed(2)+ "&#176;</br>";
      spopup += "<b>Bearing (from Lead): </b>" + lttbearing.toFixed(2) + "&#176;</br>";
      spopup += "<b>Azimuth: </b>" + apobj.azimuth+ "&#176;</br>";
      spopup += "<b>Beamwidth: </b>" + apobj.beamwidth+ "&#176;</br>";
      spopup += "<b>AP Ant Gain: </b>" + apobj.ap_antenna_gain+ " dBi</br>";
      spopup += "<b>Frequency: </b>" + apobj.frequency_mhz+ " MHz</br>";
      spopup += "<b>Channel Width: </b>" + apobj.channel_width_mhz + "</br>";
      spopup += "<b>TX Pwr: </b>" + apobj.tx_power_dbm + " dBm</br>";
      spopup += "<b>Noise Floor: </b>" + apobj.avg_noise_floor_dbm + " dBm</br>";
      spopup += "<b>RX Elevation: </b> " + apobj.cpe_elv + " ft</br>";
      spopup += "<b>RX Antenna Gain: </b> " + apobj.cpe_gain + " dBi </br>";
      spopup += "<b>FSPL: </b>" + apobj.fspl + " dB</br>";
      spopup += "<b>Line Losses: </b> 2 dB</br>";
      spopup += "<b>Clutter Loss: </b>" + apobj.clutterloss + " dB </br>";
      spopup += "<b>Total RX Signal: </b>" + apobj.signal + " dB</br>";
      spopup += "<b>Min Install Signal: </b>" + apobj.min_sig + " dB</br>";
      spopup += "<b>Max Speeds: </b>" + apobj.max_down + "/" + apobj.max_up + " Mbps</br>";
      spopup += apobj.tputs;
      spopup += "<b>Serviceable: </b>" + apobj.served  + "</br>";
      var lat = Number(apobj.lat);
      var lon = Number(apobj.lon);
      let rnd = self.getRndInteger(1,16777215);
      console.log("rnd " + rnd);
      // var fcolor = rnd.toString(16);
      // fcolor = '#' + fcolor;
      var fcolor = apobj.color;
      var shaperadarr:any = self.apiService.sectorShapes(apobj,0,null);
      var radpoly;
      if (apobj.id == self.bestApId){
        fcolor = '#00ff00';
        self.bestAp = "<b>Best </b>" + spopup;
        radpoly = polygon(shaperadarr, {color:fcolor, fillColor: fcolor, fill: true, stroke:true, weight:3, fillOpacity: 0.70});
      }else{
        radpoly = polygon(shaperadarr, {color:fcolor, fillColor: fcolor, fill: true, stroke:false,opacity: 0.60});

      }
      
      //var radpoly = polygon(shaperadarr, {color:fcolor, fillColor: fcolor, fill: true, stroke:false,opacity: 0.85});
      //radpoly.bindPopup(spopup);
      self.qualifyObjs.push(radpoly);

      var radlos = polyline([new LatLng(lat,lon),new LatLng(Number(loclat),Number(loclon))],{
                    color: fcolor,
                    weight: 3,
                    opacity: 1,
                    smoothFactor:1,
                    pane: 'qualify',
                    
                  });
      const pup = new Popup({closeButton:false,closeOnEscapeKey:true});
      pup.setContent(spopup);
      radlos.bindPopup(pup);
      self.qualifyLos.push(radlos);

    })
    
    var qualapLayer = new LayerGroup(this.qualifyObjs);
    
    qualapLayer['name'] = "Qualify APs";
    qualapLayer.setZIndex(-1);
    
    this.allOverlays["Qualify APs"] = qualapLayer;


    var qualloslayer = new LayerGroup(this.qualifyLos);
    qualloslayer['name'] = "Qualify Paths";
    qualloslayer.setZIndex(998);
    this.allOverlays["Qualify Paths"] = qualloslayer;

    this.buildLayercontrol("Qualify");
    this.onResize(null);
    if(this.showGraphs){
      //this.qualifyLead();
    }
    return true;
  }

  cancelQualify(){
    const self= this;
    self.removeQualobjs();
    self.qualprofs = [];
    this.showGraphs = false;
    this.graphsMin = false;
    this.showQualfrm = false;
    self.bestApId = null;

  }

  onResize(event) {
    //event.target.innerWidth;
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  removeQualobjs(){
    var self=this;
    if(this.qualifyObjs && this.qualifyObjs.length > 0){
      this.qualifyObjs.forEach(function(qobj){
        if (self.allOverlays["Qualify APs"].hasLayer(qobj)){
          self.allOverlays["Qualify APs"].removeLayer(qobj);

        }

      })

      this.qualifyLos.forEach(function(qobj){
        if (self.allOverlays["Qualify Paths"].hasLayer(qobj)){
          self.allOverlays["Qualify Paths"].removeLayer(qobj);

        }

      })
    }

    this.qualifyObjs = [];
    this.qualifyLos = [];


  }

  toggleGraph(p){
    p.showGraph = !p.showGraph;

  }

  chartActivate(data,id): void {
    console.log('Activate', JSON.stringify(data));
  }

  selectProfile(p) {
    this.profShow = true;
    this.bigProfdata = p;
  }

  closeProfile(){
    this.profShow = false;
    this.bigProfdata = [];
  }

  hideGraphs(){
    this.graphsMin = !this.graphsMin;
  }

  onError(e){
    console.log(e);
  }

  profileMousemove(e,p){
    // var cht = new google.visualization.LineChart(document.getElementById(p.ap_name));
    console.log("in mousemove");
    console.log(e);
    if (e.row){
      console.log(e);
      var dist = p.gchtdata[e.row][0] *1000;//in meters
      var aplat = p.lat;
      var aplon = p.lon;
      var ang = p.bearing;
      var vinc = Vincenty.destVincenty(aplat, aplon, ang, dist);


      var pmarkerlatlon = new LatLng(vinc.lat,vinc.lon);
      console.log(vinc.lat,vinc.lon);

      var self=this;
      if (self.profMouseObj){
        self.profMouseObj.forEach(function(pobj){
          if (self.allOverlays["Profile Marker"].hasLayer(pobj)){
            self.allOverlays["Profile Marker"].removeLayer(pobj);

          }


        })
      }
      self.profMouseObj = [];
      var chmarker;
      var losicon = icon({iconUrl: '/assets/images/crosshair.png', iconSize: [20,20], iconAnchor: [10,10]});
          
          chmarker = marker(pmarkerlatlon,{draggable: false, icon: losicon, zIndexOffset:999});
         
          
          this.profMouseObj.push(chmarker);
          var profObjMarker = new LayerGroup(this.profMouseObj);
          profObjMarker['name'] = "Profile Marker";
          this.allOverlays["Profile Marker"] = profObjMarker;
          console.log('adding crosshair to map')
          this.allOverlays["Profile Marker"].addTo(self.map);
      
      //console.log("has row and dist " + dist)
    }
  }

  layerChange(name, isSelected, section){
    var self = this;
    //const lcChecks = (this.form.controls.name as FormArray);
    var lcArray = []
    lcArray = this.layerControl;
    if(section == "Tiles"){
      lcArray = this.tileLayers;
      console.log("changing tile layer");
    }

    /* if(section == "Frequencies"){
      lcArray = this.frequencyLayers;
    }
    if(section == "Viewsheds"){
      lcArray = this.viewShedlayers;
    } */
    if(section == "Qualify"){
      lcArray = this.qualifyLayers;
    }
    /*
    if(section == "Search Results"){
      lcArray = this.searchLayers;
    }
    if(section == "What If"){
      lcArray = this.whatifLayers;
    } */
    var foundlayer = false;
    
    //look through each object to see if they need to be turned off
    lcArray.forEach(function(LClayer){
        var lcLayername = LClayer.name;
        if (lcLayername == name){
          foundlayer = true;
          //turn off all sublayers if on else turn on sublayers marked as selected
          var lcSublayers = LClayer.layers;
          if(isSelected == true){
            LClayer.isSelected = true;
            //turn on all sublayers currently marked as on
            if(lcSublayers.length > 0){
              lcSublayers.forEach(function(sublayer){
                var subname = sublayer.name;
                var subselect = sublayer.isSelected;
                if (subselect){
                  if(self.allOverlays[subname]){
                    self.allOverlays[subname].addTo(self.map);
                  }
                }

              });
            }
          }else{
            LClayer.isSelected = false;
            //turn off all sublayers, but leave their own object isSelected alone
            if(lcSublayers.length > 0){
              lcSublayers.forEach(function(sublayer){
                var subname = sublayer.name;
                if (self.map.hasLayer(self.allOverlays[subname])){
                  self.map.removeLayer(self.allOverlays[subname]);
                  //if(subname == 'clutterTiles')
                }
                
              });
            }
            LClayer.isSelected = false;
          }
          
        }else{
          //check all sublayers to see if name is one of those
          var lcSublayers = LClayer.layers;
          lcSublayers.forEach(function(sublayer){
            var subname = sublayer.name;
            if(name == subname){
              foundlayer = true;
              if(isSelected){
                if(self.allOverlays[subname]){
                  self.allOverlays[subname].addTo(self.map);
                  if(subname == 'Clutter30'){
                    self.showClutter30 = true;
                    
                  }
                  if(subname == 'Clutter'){
                    self.showClutter10 = true;
                    
                  }
                  
                }
                sublayer.isSelected = true;
              }else{
                if (self.map.hasLayer(self.allOverlays[subname])){
                  self.map.removeLayer(self.allOverlays[subname]);
                  if(subname == "Clutter30"){
                    self.showClutter30 = false
                  }
                  if(subname == "Clutter"){
                    self.showClutter10 = false
                  }

                }
                sublayer.isSelected = false;
              }

            }

          });
        }
    });

    GlobalVars.layerControl = this.layerControl;

  }

  selectChange(name, isSelected, section){
    var self = this;
    //const lcChecks = (this.form.controls.name as FormArray);
    var lcArray = []
    lcArray = this.layerControl;
    if(section == "Tiles"){
      lcArray = this.tileLayers;
    }
    /* if(section == "Frequencies"){
      lcArray = this.frequencyLayers;
    }
    if(section == "Viewsheds"){
      lcArray = this.viewShedlayers;
    }
    if(section == "Qualify"){
      lcArray = this.qualifyLayers;
    }
    if(section == "Search Results"){
      lcArray = this.searchLayers;
    }
    if(section == "Search Results"){
      lcArray = this.whatifLayers;
    } */

    var foundlayer = false;
    
    //look through each object to see if they need to be turned off
    lcArray.forEach(function(LClayer){
        var lcLayername = LClayer.name;
        if (lcLayername == name){
          foundlayer = true;
          //if checked then mark all sublayers
          var lcSublayers = LClayer.layers;
          if(isSelected == true){
            //LClayer.isSelected = true;
            //turn on all sublayers currently marked as on
            if(lcSublayers.length > 0){
              lcSublayers.forEach(function(sublayer){
                var subname = sublayer.name;
                sublayer.isSelected = true;
              });
            }
            self.layerChange(name, LClayer.isSelected, section);
          }else{
            //LClayer.isSelected = false;
            //turn off all sublayers, but leave their own object isSelected alone
            if(lcSublayers.length > 0){
              lcSublayers.forEach(function(sublayer){
                var subname = sublayer.name;
                sublayer.isSelected = false;
              });
            }
            self.layerChange(name, false, section);
            //LClayer.isSelected = false;
          }
          
        }
    });

    GlobalVars.layerControl = this.layerControl;
  }

  toggleQualify(){
    this.qualShow = !this.qualShow;
  }

  toggleNetwork(){
    this.networkShow = !this.networkShow;
  }

  doMapstuff(){
    const self = this;
    this.getSites();
    this.getAPs();
    //this.getTiles();
    this.getFilerinfo();
    this.buildTileLayer();
    this.getTotalLocations();
    this.getSevicedLocations();
    this.getFiberSevicedLocations();
    this.getCableSevicedLocations();
    this.getDslSevicedLocations();
    this.getcnheatSevicedLocations();
    this.getCopperSevicedLocations();

    if(this.activeSites.length > 1){
      //this.findCenter(this.activeSites);
    }

   /*  if(self.apData){
      self.createAPsmapobj();
    }
    if(self.siteData){
      self.createSitesmapobj();
      this.findCenter(self.siteData);
    }
    if(self.serviceLocs){
      self.createLocationmapobj();
    }
    if(self.boundsData){
      self.buildBoundsLayers();
    } */

  }

  /* toggleFreq(){
    this.frequencyShow = !this.frequencyShow;
  }

  toggleViewsheds(){
    this.viewshedShow = !this.viewshedShow;
  }

  toggleSearch(){
    this.searchShow = !this.searchShow;
  }

  toggleWhatif(){
    this.whatifshow = !this.whatifshow;
  }

  toggleTile(){
    this.tileShow = !this.tileShow;
  } */

}
