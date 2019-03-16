import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { isArray, forEach } from 'lodash';
import { ProductsService } from '../../../core/services/products.service';
import { CustomersService } from '../../../core/services/customers.service';
import { OrdersService } from '../../../core/services/orders.service';
import { Product } from '../../../core/classes/product';
import { Customer } from '../../../core/classes/customer';
import { Order } from '../../../core/classes/order';
import { StatsService } from '../../../core/services/stats.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductDetail } from '../../../core/classes/product-detail';

@Component({
  selector: 'app-dam-pharm-orders-add',
  templateUrl: './add.component.html',
  styles: []
})
export class AddComponent implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;
  private _addSub: Subscription = undefined;
  private _customerSub: Subscription = undefined;

  @Output('update')
  update: EventEmitter<Order> = new EventEmitter<Order>();

  products: Product[] = [];
  customers: Customer[] = [];
  order: Order;

  constructor(
    private _productsService: ProductsService,
    private _customersService: CustomersService,
    private _ordersService: OrdersService,
    private _statsService: StatsService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
    this._utils.unsubscribeSub(this._customerSub);
    this._utils.unsubscribeSub(this._addSub);
  }

  async onSubmit() {
    this._utils.unsubscribeSub(this._addSub);

    this._addSub = await this._ordersService.add(this.order).subscribe(
      data => {
        this.order=data;
        this._utils.notyf('success','Order '+ this.order.id +' added successfuly');
        this.update.emit(this.order);
        this.init();
      }
    );
  }

  init() {
    this._utils.unsubscribeSub(this._sub);
    this._utils.unsubscribeSub(this._customerSub);
    this.order = new Order();
    this.order.productDetails.push(new ProductDetail());

    this._sub = this._productsService.get("/order").subscribe(
      data => {
        forEach(data, (product: Product) => {
          if (product.numberOfRemainStock > 0) {
            this.products.push(product);
          }
        });
      },
      err => { console.log(err); }
    );

    this._customerSub = this._customersService.get("/order").subscribe(
      data => this.customers = data,
      err => { console.log(err); }
    );
  }

  onAdd() {
    this.order.productDetails.push(new ProductDetail());
  }

  available_stock(e: any, i: number) {

    console.log('>>>>'+this.order.productDetails[i].product.numberOfRemainStock);
    if (e.target.value > this.order.productDetails[i].product.numberOfRemainStock) {
      return e.target.value = this.order.productDetails[i].product.numberOfRemainStock;
    }
  }

}
