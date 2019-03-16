import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../core/classes/order';
import { TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { UtilsService } from '../../../shared/services/utils.service';
import { GenericPagination, EventData } from '../../../core/classes/generic-pagination';
import { OrderFilter } from '../../../core/classes/filter';
import { HttpMethod } from '../../../core/classes/page-loader/page-loading';
import { map } from 'lodash';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var numeral: any;
declare var jQuery: any;
@Component({
  selector: 'app-dam-pharm-orders-report',
  templateUrl: './report.component.html',
  styles: []
})
export class ReportComponent extends GenericPagination<Order> implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;

  currency = numeral();
  order: OrderFilter= new OrderFilter();

  constructor(
    private _ordersService: OrdersService,
    public translate: TranslateService,
    private _utils: UtilsService
  ) { 
    super(_ordersService);
  }

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  ngAfterViewInit() {
    jQuery('input[uk-datepicker]').datepicker({
      format: 'yyyy-MM-dd'
    });
  }

  onSubmit() {
    this._utils.unsubscribeSub(this._sub);
    map(jQuery('input[uk-datepicker]'), el => {
      const input = jQuery(el)[0];
      this.order.created_at[input.name.slice().replace('date_', '')] = input.value;
      return el;
    });

    this.page=0
    this.order.page = this.page ;
    this.setPageParam(this.order);
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }

  loadOrders() {
    this._utils.unsubscribeSub(this._sub);
    this.order.page = this.page;
    this.setPageParam(this.order);
    // this.isUpdateEvent=true;
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }

  totalSum(order:Order) :number
  {
    let totalSum=0;

    order.productDetails.forEach((item, i) => {

      totalSum = totalSum + (((100 - item.discount) * item.product.selling_price * item.amount) / 100);

    });
    return totalSum;
  }

  format(): string {
    return this._utils.format;
  }

  async save() {
    const docDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
        style: 'tableExample',
        table: {
          headerRows: 1,
          body: [
            [
              {
                text: this.translate.instant('table.order.id').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.product.name').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.customer.name').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.amount').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.price').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.total').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.date').toUpperCase(),
                style: 'tableHeader'
              }
            ]
          ]
        },
        layout: {
          hLineWidth: (i: any, node: any) => {
            return (i === 0 || i === node.table.body.length) ? 2 : 1;
          },
          vLineWidth: (i: any, node: any) => {
            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
          },
          hLineColor: (i: any, node: any) => {
            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
          },
          vLineColor: (i: any, node: any) => {
            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
          }
        }
      }
    ],
      styles: {
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      }
    };
    pdfMake.createPdf(docDefinitions).download('orders.pdf');
  }

}
