import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/classes/order';
import { Subscription } from 'rxjs/Subscription';
import { UtilsService } from '../../shared/services/utils.service';
import { GenericPagination } from '../../core/classes/generic-pagination';
import { OrderFilter } from '../../core/classes/filter';
import { HttpMethod } from '../../core/classes/page-loader/page-loading';

@Component({
  selector: 'app-dam-pharm-orders',
  templateUrl: './orders.component.html',
  styles: []
})
export class OrdersComponent extends GenericPagination<Order> implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;
 

  constructor(
    protected _ordersService: OrdersService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) {
    super(_ordersService);
   }

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  loadOrders() {
    this._utils.unsubscribeSub(this._sub);
    const param = new OrderFilter();
    param.page = this.page;
    this.setPageParam(param);
    this.method=HttpMethod.POST;
    this.loadPage();
  }

  onUpdate(order: Order) {
    console.log("PPPPPPPPPPPPP:::::"+this.results.length);
    this.results.push(order);
  }

}
