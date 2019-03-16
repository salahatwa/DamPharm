import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { NgProgress } from 'ngx-progressbar';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { UtilsService } from '../../shared/services/utils.service';
import { Config } from '../../shared/classes/app';
import { OrderFilter } from '../classes/filter';
import { Order } from '../classes/order';
import { AuthService } from './auth.service';
import { CrudService } from '../../shared/services/crud.service';
import { REQUEST_OPTIONS_DEFAULT } from '../../shared/services/request-options.default';


@Injectable()
export class OrdersService extends CrudService<Order, number>{
  private _ordersUrl = `${new Config().api}/orders`;
  private _headers = this._utils.makeHeaders({ withToken: true });

  constructor(
    private _utils: UtilsService,
    private _http: Http,
    private _router: Router,
    protected _progress: NgProgress ,
    private _auth : AuthService
  ) {
    super(`${new Config().api}/orders`, _http,REQUEST_OPTIONS_DEFAULT,_progress);
   }

  
  find(id: string): Observable<Order> {
    this.beforeRequest();

    return this._http.get(`${this._ordersUrl}/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => {  this.afterRequest(); },
        error => { console.log(error); }
      );
  }

  add(order: Order): Observable<Order> {
    this.beforeRequest();
    const body = JSON.stringify(order);
    console.log('Adding Order ...' + JSON.stringify(order));

    return this._http.post(`${this._ordersUrl}/add`, body, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => this.afterRequest(),
        error => { console.log(error); }
      );
  }

  delete(id: number): Observable<Order[]> {
    this.beforeRequest();

    return this._http.delete(`${this._ordersUrl}/delete/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => this.afterRequest(),
        error => { console.log(error); }
      );
  }

  beforeRequest(): void {
    this._progress.start();
  }



}
