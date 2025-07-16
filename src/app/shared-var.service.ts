import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedVarService {

  private periodEnd: BehaviorSubject<string>;

  constructor() {
    this.periodEnd = new BehaviorSubject<string>('');
  }

  getValue(): Observable<string> {
    return this.periodEnd.asObservable();
  }
  setValue(newValue:any): void {
    this.periodEnd.next(newValue);
  }

}