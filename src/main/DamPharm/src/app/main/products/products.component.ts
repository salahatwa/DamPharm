import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/classes/product';
import { UtilsService } from '../../shared/services/utils.service';
import { GenericPagination } from '../../core/classes/generic-pagination';
import { ProductFilter } from '../../core/classes/filter';
import { HttpMethod } from '../../core/classes/page-loader/page-loading';

@Component({
  selector: 'app-dam-pharm-products',
  templateUrl: './products.component.html',
  styles: []
})
export class ProductsComponent extends GenericPagination<Product> implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;
 

  constructor(
    protected _productService: ProductsService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) { 
    super(_productService);
  }

  ngOnInit() {
    this._loadProducts();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  private _loadProducts() {
    this._utils.unsubscribeSub(this._sub);
    const param = new ProductFilter();
    param.page = this.page;
    this.setPageParam(param);
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }

  onUpdate(product: Product) {
    this.results.push(product);
  }

}
