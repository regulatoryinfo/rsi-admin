import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import * as Vincenty from 'node-vincenty';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient,) { }


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  url = 'https://www.regulatorysolutions.us';

  
  public getadminUsers(org){
    return this.httpClient.get(`${this.url}/auth/getAdminusers`);
  }

  public savePassword(user,password){
    return this.httpClient.post(`${this.url}/auth/saveAdminpass`, {"user": user, "password": password});
  }

  public getOrgdata(org){
    return this.httpClient.get(`${this.url}/company/getOrgadmin/` + org);
  }

  public getInvoices(org){
    return this.httpClient.get(`${this.url}/payment/getInvoices/` + org);
  }

  public getUsers(org){

    return this.httpClient.get(`${this.url}/admin/getUsersadmin/` + org);

  }


  public getAdminreport(period_end:any){
    return this.httpClient.get(`${this.url}/export/getAdminreport/` + period_end );
  }

  public prepareBdcfiling(org,period_end:any){
    return this.httpClient.get(`${this.url}/admin/prepBdcfiling/` + org + '/' + period_end );
  }

  public checkDuplicates(org,period_end:any){
    return this.httpClient.get(`${this.url}/admin/checkTracts/` + org + '/' + period_end );
  }

  public getAdminSites(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminSites/` + org_id);
  }

  public getAdminAps(org_id:number){
    
    return this.httpClient.get(`${this.url}/admin/getAdminAps/` + org_id );
  }

  public getAdminNetworkBounds(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminNetworkBounds/` + org_id );
  }

  public getAdminFiberBounds(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminFiberBounds/` + org_id );
  }

  public getAdminCableBounds(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminCableBounds/` + org_id );
  }

  public getAdminDslBounds(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminDslBounds/` + org_id );
  }

  public getAdminCopperBounds(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminCopperBounds/` + org_id );
  }

  public getPathprofiles(org_id,aps,lat,lon,elv,resolution,loc){
    //return this.httpClient.post(`${this.url}/admin/getPathprofilesnew/` + org_id + `/` + lat + `/` + lon + `/` + elv + `/` + resolution , aps);
    return this.httpClient.post(`${this.url}/admin/getPathprofilesmongo/` + org_id + `/` + lat + `/` + lon + `/` + elv + `/` + resolution + `/` + loc , aps);
  }

  public pe_approve(org_id, period){
    return this.httpClient.post(`${this.url}/admin/peApprove/` + org_id + '/' + period, null);
  }

  public getAdminFilerInfo(org_id){
    return this.httpClient.get(`${this.url}/admin/getAdminFilerInfo/` + org_id );
  }

  public getTileJson(tilename){
    return this.httpClient.get(`${this.url}/admin/getTileJson/` + tilename );
  }

  public getTotalLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getTotalLocations/` + org_id );
  }

  public getServicedLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getServicedLocations/` + org_id );
  }

  public getFiberServicedLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getFiberServicedLocations/` + org_id );
  }

  public getCableServicedLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getCableServicedLocations/` + org_id );
  }

  public getDslServicedLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getDslServicedLocations/` + org_id );
  }

  public getCopperServicedLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getCopperServicedLocations/` + org_id );
  }

  public getcnheatServicedLocations(org_id){
    return this.httpClient.get(`${this.url}/admin/getcnheatServicedLocations/` + org_id );
  }

  public getLocationAps(org_id, loc){
    return this.httpClient.get(`${this.url}/admin/getLocationAps/` + org_id + '/' + loc);
  }

  public getcnHeatraw(org_id){
   
    return this.httpClient.get(`${this.url}/admin/getcnHeatobs/` + org_id );
  }

  public getVincenty(lat1,lon1,lat2,lon2){
    var vinc = Vincenty.distVincenty(lat1, lon1, lat2, lon2);
    return vinc;
  }


   //finds angle between two other lines
   public angleBetween(n,a,b){
    
    n = (360 + (n % 360)) % 360;
    a = (3600000 + a) % 360;
    b = (3600000 + b) % 360;

    if (a < b)
            return a <= n && n <= b;
    return a <= n || n <= b;


  }

  //get aps within range
  public findAPslocal(lat,lon,apobj){
    var apdistance = new Array();
    console.log("here");

    var incov = false;

    var insectcnt = 0;
    var aps = new Array();

    var sc = 0;
    for (var i in apobj){
      //alert(apobj[i].coords);
      var sectcolor = "#00FF00";


      incov = false;

        var aplat = parseFloat(apobj[i].lat);
      var aplon = parseFloat(apobj[i].lon);
      //var ept = new OpenLayers.Geometry.Point(latlng.lon, latlng.lat).transform(proj_2, proj_1);


        var distvinc = Vincenty.distVincenty(aplat, aplon, parseFloat(lat), parseFloat(lon));
        apdistance[i] = distvinc.distance / 1000;
        console.log(apobj[i].ap_name + ", " + Number(apobj[i].coverage_radius_mi)* 1.609344 + ", " + apdistance[i]);
        if (apdistance[i] <= Number(apobj[i].coverage_radius_mi)* 1.609344){

            //see if geocoded point is within bw of antenna
            var ang1 = Number(apobj[i].azimuth) - Number(apobj[i].beamwidth) /2;

            var ang2 = Number(apobj[i].azimuth) + Number(apobj[i].beamwidth) /2;
            //var heading = google.maps.geometry.spherical.computeHeading(apobj[i].coords,latlng);

            var heading = distvinc.initialBearing;


            if (apobj[i].beamwidth == 360){
              incov = true;
            }else{
              incov = this.angleBetween(heading,ang1,ang2);
            }

            if(incov){
                apobj[i].bearing = heading;
                aps.push(apobj[i]);


             }

     }

   }

   return aps;


  }

  //find towers within a given radius of a customer point
  public findTowers(lat,lng, towers, radius){
    var twrdistance = new Array();
    var incov = false;

    var insectcnt = 0;
    var twrs = new Array();

    var sc = 0;
    //var radius = 7;
    for (var i in towers){
      //alert(apobj[i].coords);
      var sectcolor = "#00FF00";


      incov = false;

      var twrlat = parseFloat(towers[i].latitude);
      var twrlon = parseFloat(towers[i].longitude);
      //var ept = new OpenLayers.Geometry.Point(latlng.lon, latlng.lat).transform(proj_2, proj_1);


        var distvinc = Vincenty.distVincenty(twrlat, twrlon, parseFloat(lat), parseFloat(lng));
        twrdistance[i] = distvinc.distance / 1000;
        //console.log(apobj[i].name + ", " + Number(apobj[i].radius)* 1.609344 + ", " + apdistance[i]);
        if (twrdistance[i] <= Number(radius)* 1.609344){

            var heading = distvinc.initialBearing;

            incov = true;

            if(incov){
                twrs.push(towers[i]);
            }

        }

    }


    return twrs;
  }

  public sectorShapes(ap, mode,contact){
    var radius;
    //if (mode == 0){
      radius = ap.coverage_radius_mi;
    //}else{
      //radius = 0.75;
    //}

    var clat;
    var clon;
    if (contact){
        clat = contact.lat;
        clon = contact.lon;
    }
    var aplat = Number(ap.lat);
    var aplon = Number(ap.lon);

    var startprof = [aplat,aplon];
    var endprof = [Number(clat),Number(clon)];

    var erdist = radius * 1.609344*1000;
    var ang1 = ap.azimuth - ap.beamwidth /2;

    var ang2 = ap.azimuth + ap.beamwidth /2;

    var vinc = Vincenty.destVincenty(aplat, aplon, ang1, erdist);


    var endrad1 = [vinc.lat,vinc.lon];

    var vinc2 = Vincenty.destVincenty(aplat, aplon, Number(ang2), erdist);
    var endrad2 =[vinc2.lat,vinc2.lon];

    var llarr = new Array();
    //llarr[0] = apobj[i].coords;
    if (ap.bw == 360){
      llarr[0] = endrad1;
      llarr[1] = endrad1;
      }else{
      llarr[0] = [Number(ap.lat), Number(ap.lon)];
      llarr[1] = endrad1;
    }


    var npts = 101;

    for (var j=2;j<npts;j++){
      var newang = ang1 + (j*(ap.beamwidth/(npts-1)));

      var vinc = Vincenty.destVincenty(aplat, aplon, newang, erdist);

      llarr[j] =  [vinc.lat, vinc.lon];

    }

    return llarr;


  }

}