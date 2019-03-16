import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NgProgress } from 'ngx-progressbar';
import { UtilsService } from '../../shared/services/utils.service';
import { Config } from '../../shared/classes/app';
import { Product } from '../classes/product';
import { ProductFilter } from '../classes/filter';
import { Customer } from '../classes/customer';
import { AuthService } from './auth.service';
import { ErrorMessage } from '../classes/errorMessage';
import { CrudService } from '../../shared/services/crud.service';
import { REQUEST_OPTIONS_DEFAULT } from '../../shared/services/request-options.default';


@Injectable()
export class ProductsService extends CrudService<Product, number>{
  private _productsUrl = `${new Config().api}/products`;
  private _headers = this._utils.makeHeaders({ withToken: true });

  constructor(
    private _utils: UtilsService,
    private _http: Http,
    private _router: Router,
    protected _progress: NgProgress,
    private _auth:AuthService
  ) { 
    super(`${new Config().api}/products`, _http,REQUEST_OPTIONS_DEFAULT,_progress);
  }


  find(id: string): Observable<Product> {
    this.beforeRequest();

    return this._http.get(`${this._productsUrl}/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => { console.log('PRODUCTS: ' + JSON.stringify(data)); this.afterRequest(); },
        error => { this.afterRequest();this._utils.handleError(error); this.gotoProductsPage();}
      );
  }

  getCustomers(id: string): Observable<Customer[]> {
    this.beforeRequest();

    return this._http.get(`${this._productsUrl}/customers/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => { console.log('CUSTOMERS: ' + JSON.stringify(data)); this.afterRequest(); },
        error => { this.afterRequest();this._utils.handleError(error); this.gotoProductsPage();}
      );
  }

  add(product: Product): Observable<Product> {
    this.beforeRequest();

    const body = JSON.stringify(product);

    return this._http.post(`${this._productsUrl}/add`, body, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => {this._utils.notyf('success',"product added :"+data.name); this.afterRequest();},
        error => { this.afterRequest();this._utils.handleError(error);this.gotoProductsPage(); }
      );
  }

  update(id: string, product: Product): Observable<Product> {
    this.beforeRequest();
    const body = JSON.stringify(product);

    return this._http.put(`${this._productsUrl}/update/${id}`, body, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => {this._utils.notyf('success',"product updated successfuly:"+data.name); this.afterRequest();},
        error => { this.afterRequest();this._utils.handleError(error); this.gotoProductsPage();}
      );
  }

  delete(id: string): Observable<Product> {
    this.beforeRequest();

    return this._http.delete(`${this._productsUrl}/delete/${id}`, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
        data => { this._utils.notyf('success',"product deleted successfuly"); this.afterRequest();this.gotoProductsPage();},
        error => { this.afterRequest();this.gotoProductsPage();this._utils.handleError(error);}
      );
  }

  gotoProductsPage()
  {
    this._router.navigate(['/dashboard/products']);
  }

  beforeRequest(): void {
    this._progress.start();
  }

  afterRequest(): void {
    this._progress.done();
  }

}
