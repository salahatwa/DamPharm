import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { NgProgress } from 'ngx-progressbar';
import { UtilsService } from '../../shared/services/utils.service';
import { Config } from '../../shared/classes/app';
import { Stat, TopProduct } from '../classes/stat';
import { AuthService } from './auth.service';

@Injectable()
export class StatsService {
  private _statsUrl = `${new Config().api}/stats`;
  private _headers = this._utils.makeHeaders({ withToken: true });

  constructor(
    private _utils: UtilsService,
    private _http: Http,
    private _router: Router,
    private _progress: NgProgress , 
    private _auth:AuthService
  ) { }

  get(): Observable<Stat> {
    return this._http.get(this._statsUrl, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => { console.log('States HERE#####: ' + JSON.stringify(data)); this.afterRequest(); },
        error => { console.log(error); }
      );
  }

  topProducts(): Observable<TopProduct[]> {
    return this._http.get(`${this._statsUrl}/`+this._auth.getCurrentLoggedInUser().id+`/top/products`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => { console.log('TOP PRODUCTS: ' + JSON.stringify(data)); this.afterRequest(); },
        error => { console.log(error); }
      );
  }

  beforeRequest(): void {
    this._progress.start();
  }

  afterRequest(): void {
    this._progress.done();
  }

}
