import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersService } from '../../../core/services/customers.service';
import { Customer } from '../../../core/classes/customer';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { map, isArray } from 'lodash';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { UtilsService } from '../../../shared/services/utils.service';
import { CustomerFilter } from '../../../core/classes/filter';
import { GenericPagination } from '../../../core/classes/generic-pagination';
import { HttpMethod } from '../../../core/classes/page-loader/page-loading';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var numeral: any;
declare var jQuery: any;
@Component({
  selector: 'app-dam-pharm-customers-report',
  templateUrl: './report.component.html',
  styles: []
})
export class ReportComponent extends GenericPagination<Customer> implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;
  customer: CustomerFilter= new CustomerFilter();;

  constructor(
    private _customersService: CustomersService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) { 
    super(_customersService);
  }

  ngOnInit() {
    this.loadCustomers();
  }

  ngAfterViewInit() {
    jQuery('input[uk-datepicker]').datepicker({
      format: 'yyyy-MM-dd'
    });
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  onSubmit() {
    this._utils.unsubscribeSub(this._sub);
    map(jQuery('input[uk-datepicker]'), el => {
      const input = jQuery(el)[0];
      this.customer.created_at[input.name.slice().replace('date_', '')] = input.value;
      return el;
    });

    this.page=0
    this.customer.page = this.page ;
    this.setPageParam(this.customer);
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }

  loadCustomers() {
    this._utils.unsubscribeSub(this._sub);
    this.customer.page = this.page;
    this.setPageParam(this.customer);
    // this.isUpdateEvent=true;
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }

  async save() {
    const docDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [{
        style: 'tableExample',
        table: {
          headerRows: 1,
          body: [
            [
              {
                text: this.translate.instant('table.number').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.customer.name').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.company.name').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.email').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: [
                  this.translate.instant('form.label.postal-code'),
                  this.translate.instant('form.label.city')
                ].join(', ').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.country').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.address').toUpperCase(),
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
      }],
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
    await this.results.forEach((item, i) => {
      docDefinitions.content[0].table.body.push([
        i + 1,
        item.full_name,
        item.company_name,
        item.email,
        [item.postal_code, item.city].join(', '),
        item.country,
        <any>item.address
      ]);
    });
    pdfMake.createPdf(docDefinitions).download('customers.pdf');
  }

}
