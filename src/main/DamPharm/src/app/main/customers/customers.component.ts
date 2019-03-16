import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { CustomersService } from '../../core/services/customers.service';
import { Customer } from '../../core/classes/customer';
import { UtilsService } from '../../shared/services/utils.service';
import { GenericPagination } from '../../core/classes/generic-pagination';
import { CustomerFilter } from '../../core/classes/filter';
import { HttpMethod } from '../../core/classes/page-loader/page-loading';

@Component({
  selector: 'app-dam-pharm-customers',
  templateUrl: './customers.component.html',
  styles: []
})
export class CustomersComponent extends GenericPagination<Customer> implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;


  constructor(
    protected _customerService: CustomersService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) {
    super(_customerService);
   }

  ngOnInit() {
    this.loadCustomers();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  loadCustomers() {
    this._utils.unsubscribeSub(this._sub);
    const param = new CustomerFilter();
    param.page = this.page;
    this.setPageParam(param);
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }

  onUpdate(customer: Customer) {
    this.results.push(customer);
  }

}
