import {Component, AfterViewInit} from '@angular/core';


@Component({
  selector: 'app-root',
  //templateUrl: './app.component.html',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor() {

  }

    ngAfterViewInit() {

    };


}

