import {Component, ViewChild, OnInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, SortDirection, Sort} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import { ApiService } from '../api.service';
import { SharedVarService } from '../shared-var.service';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalVars } from '../common/globals';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
  displayedColumns: string[] = ['id','company','email','info','subscription','sites','aps','wired','settings','fabric','cnheat','state','bdc','pe','dups','prep','cust'];
  //exampleDatabase: ExampleHttpDatabase | null;
  //data: GithubIssue[] = [];
  companyData = new MatTableDataSource([]);

  dataSource:any;
  period_end: string = 'Dec 31, 2024';
  

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('statSort') statSort = new MatSort();
  @ViewChild('periodEnd', {static: true}) perEnd:ElementRef;

  constructor(private apiService:ApiService,private service: SharedVarService,private router: Router) {
    this.service.setValue(this.period_end);
  }

    ngOnInit() {
      GlobalVars.period_end = this.period_end;
      this.companyData.sort = this.statSort;
      
      this.service.setValue(this.period_end);
      this.perEnd.nativeElement.value = this.period_end;

    this.service.getValue().subscribe((value) => {
      this.period_end = value;
      console.log(this.period_end);
      this.getAdmindata();
    });
    

    this.getAdmindata();

    // If the user changes the sort order, reset back to the first page.
    //this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

   /*  merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
          ).pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe(data => (this.data = data)); */
  }

  getAdmindata(){

    this.apiService.getAdminreport(this.period_end).subscribe((response: any) =>{
      if(response.result == 'success'){
        console.log('got status');
        this.companyData = new MatTableDataSource(response.orgs);
        this.companyData.sort = this.statSort;
        console.log(JSON.stringify(response.orgs));
        
      }else{

        console.log(JSON.stringify(response.error));
      }
    });
  }

  changePeriod(e:any){
    //console.log(JSON.stringify(e));
    //GlobalVars.period_end = e;
    this.period_end = e;
    this.service.setValue(e);
    GlobalVars.period_end = this.period_end;
    this.getAdmindata();
  }

  getMap(row){

    const org_id = row.id;
    GlobalVars.org_id = row.id;
    GlobalVars.company = row.company;
    if (row.pe_approved == true){
      GlobalVars.pe_approved = true;
    }else{
      GlobalVars.pe_approved = false;
    }
    const url = 'map';
    console.log("routing to " + url);
    this.router.navigate([url]).then(e =>{
      if (e) {
        console.log("nav success");
      }else{
        console.log("nav fail")
      }
    })

  }

  showCustomer(row){

    const org_id = row.id;
    GlobalVars.org_id = row.id;
    GlobalVars.company = row.company;
    if (row.pe_approved == true){
      GlobalVars.pe_approved = true;
    }else{
      GlobalVars.pe_approved = false;
    }
    const url = 'customer';
    console.log("routing to customers ");
    this.router.navigate([url]).then(e =>{
      if (e) {
        console.log("nav success");
      }else{
        console.log("nav fail")
      }
    })

  }

  prepareFiling(row){
    const org_id = row.id;
    const periodformatted = this.formatDate(this.period_end);
    console.log(periodformatted);
    this.apiService.prepareBdcfiling(org_id,periodformatted).subscribe((response: any) =>{
      if(response.result == 'success'){
        alert('Success. Files are in the directory')
        
      }else{

        console.log(JSON.stringify(response.error));
      }
    });

  }

  checkDuplicates(row){
    const org_id = row.id;
    const periodformatted = this.formatDate(this.period_end);
    console.log(periodformatted);
    this.apiService.checkDuplicates(org_id,periodformatted).subscribe((response: any) =>{
      if(response.result == 'success'){
        console.log(response.output);
        if(response.output != ''){
          alert('tracts were checked but there were errors ' + response.output);
        }
      }else{

        console.log(JSON.stringify(response.error));
      }
    });

  }

  formatDate(date){
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    let year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }


}
