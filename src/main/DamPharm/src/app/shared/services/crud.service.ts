import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';
import { CrudOperations } from './crudoperations.interface';
import { map, catchError } from "rxjs/operators";
import { Observable } from 'rxjs';
import { Page } from '../../core/classes/page';
import { NgProgress } from 'ngx-progressbar';
import { HttpMethod } from '../../core/classes/page-loader/page-loading';

@Injectable()
export class CrudService<T, ID> implements CrudOperations<T, ID>{

  protected http: Http;
  protected options: Function;
  protected base: string;

  constructor(
    base: string,
    http: Http,
    options: Function,protected _progress: NgProgress) {
    this.base = base;
    this.http = http;
    this.options = options;
  }

  save(t: T): Observable<T> {
    return this.http.post(this.base, t, this.options())
    .map((res: Response) => res.json())
    .do(
      data => {  this.afterRequest();},
      error => { this.handleError(error);this.afterRequest(); }
    );
  }
 
  findPage(query?: any,methodType?: HttpMethod): Observable<Page<T>> {

    this.beforeRequest();

    let params = new URLSearchParams();

    if (query&&methodType==HttpMethod.GET) {
       params.append('params', JSON.stringify(query));
    }

    if(methodType==HttpMethod.GET)
    {
      return this.http.get(`${this.base}`,this.options(params))
      .map((res: Response) => res.json())
      .do(
        data => {  this.afterRequest();},
        error => { this.handleError(error);this.afterRequest(); }
      );
    }
      else if(methodType==HttpMethod.POST)
      {
        return this.http.post(`${this.base}`,JSON.stringify(query),this.options())
        .map((res: Response) => res.json())
        .do(
          data => {  this.afterRequest();},
          error => { this.handleError(error);this.afterRequest(); }
        );
      }
  }


  get(url:string): Observable<T[]> {
    this.beforeRequest();
  
    return this.http.get(`${this.base}`+url,  this.options())
      .map((res: Response) => res.json())
      .do(
        data => {  this.afterRequest(); },
        error => { console.log(error); }
      );
  }

  filter(url:string): Observable<T[]> {
    this.beforeRequest();
  
    return this.http.get(`${this.base}`+url,  this.options())
      .map((res: Response) => res.json())
      .do(
        data => {  this.afterRequest(); },
        error => { console.log(error); }
      );
  }

  protected extractData(res: Response) {
    let body = res.json() || '';
    return body;
  }

  protected handleError(error: Response | any) {
    let msg;
    if (error instanceof Response) {
      msg = error.json() || '';
    } else {
      msg = error.message ? error.message : error.toString();
    }

    return Observable.throw(msg);
  }


  beforeRequest(): void {
    this._progress.start();
  }

  afterRequest(): void {
    this._progress.done();
  }

}
