import { NgModule } from '@angular/core';
import { ExtraOptions,RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { StatusComponent } from './status/status.component';
import { CustomerComponent } from './customer/customer.component';
//import { PagesModule } from './pages/pages.module';


const routes: Routes = [
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'status',
    component: StatusComponent
  },
  {
    path: 'customer',
    component: CustomerComponent
  },
  
    { path: '', redirectTo: 'status', pathMatch: 'full' },
    { path: '**', redirectTo: 'status' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes,config)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
