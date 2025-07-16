import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedVarService } from '../shared-var.service';
import { GlobalVars } from '../common/globals';
import { Router } from '@angular/router';


class User  {

  org: number = null;
  id: number = null; 
  email: string = null;
  mobile: string = null;
  password: string = null;
  name: string = null; 
  role: number = null;
  changePass: boolean = false;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  org_id: Number = GlobalVars.org_id;
  org: any = [];

  users: any;
  invoices: any;

  constructor(private apiService:ApiService,private service: SharedVarService,private router: Router) { }

  ngOnInit(): void {
    
    this.getCompanyData();

  }

  getCompanyData(){
    const self = this;
    const org_id = self.org_id;
    this.apiService.getOrgdata(org_id).subscribe((resp: any) =>{
      if(resp.result == 'success'){
        console.log(resp.data);
        
        this.org = resp.data;
        if(!this.org.addr2 || this.org.addr2 == 'undefined'){
          this.org.addr2 = '';
        }

        self.getUsers();
        self.getInvoices();

      }else{
        alert("error getting company data " + resp.error);
        console.log('error getting company data ' + resp.error);
      }
    });

  }

  getUsers(){
    const self = this;
    this.apiService.getUsers(self.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){
        console.log(JSON.stringify(response.users));
        self.users = response.users;
       
        
      }else{

        console.log('error getting users ' + JSON.stringify(response.error));
        alert('Error getting users ');
      }


    })

  }

  getInvoices(){
    const self = this;
    this.apiService.getInvoices(self.org_id).subscribe((response: any) =>{
      if (response.result == 'success'){

        self.invoices = response.invoices;
        self.invoices.forEach(function(i){
          i.payments.total_payments = Number(i.payments.total_payments);
          if (i.credits.total_credits){
            i.credits.total_credits = Number(i.credits.total_credits);
          }else{
            i.credits["total_credits"] = 0;
          }
        })

      }else{
        console.log('error getting invoices ' + response.error);
      }
    })
  }

}
