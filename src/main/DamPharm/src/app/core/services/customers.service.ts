import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { NgProgress } from 'ngx-progressbar';
import { UtilsService } from '../../shared/services/utils.service';
import { Config } from '../../shared/classes/app';
import { CustomerFilter } from '../classes/filter';
import { Customer } from '../classes/customer';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { CrudService } from '../../shared/services/crud.service';
import { REQUEST_OPTIONS_DEFAULT } from '../../shared/services/request-options.default';


@Injectable()
export class CustomersService extends CrudService<Customer, number>{
  private _customersUrl = `${new Config().api}/customers`;
  private _headers = this._utils.makeHeaders({ withToken: true });

  constructor(
    private _utils: UtilsService,
    private _http: Http,
    private _router: Router,
    protected _progress: NgProgress,
    public translate: TranslateService ,
    private _auth:AuthService
  ) {
    super(`${new Config().api}/customers`, _http,REQUEST_OPTIONS_DEFAULT,_progress);
   }


  find(id: string): Observable<Customer> {
    this.beforeRequest();

    return this._http.get(`${this._customersUrl}/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => this.afterRequest(),
        error => { this.gotoCustomersPage();this._utils.handleError(error); }
      );
  }

  add(customer: Customer): Observable<Customer> {
    this.beforeRequest();

    const body = JSON.stringify(customer);

    return this._http.post(`${this._customersUrl}/add`, body, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => this.afterRequest(),
        error => { this.gotoCustomersPage();this._utils.handleError(error);}
      );
  }

  update(customer: Customer): Observable<Customer> {
    this.beforeRequest();
    const body = JSON.stringify(customer);

    return this._http.put(`${this._customersUrl}/update`, body, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => this.afterRequest(),
        error => { this.gotoCustomersPage();this._utils.handleError(error);}
      );
  }

  delete(id: string): Observable<Customer> {
    this.beforeRequest();

    return this._http.delete(`${this._customersUrl}/delete/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => {
          this.afterRequest();
          this._utils.showToast(data);
        }
        ,
        error => { this.gotoCustomersPage();this._utils.handleError(error); }
      );
  }

  beforeRequest(): void {
    this._progress.start();
  }

 


  gotoCustomersPage()
  {
    this._progress.done();
    this._router.navigate(['/dashboard/customers']);
  }
}
