import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { map, isArray } from 'lodash';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/classes/product';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductFilter } from '../../../core/classes/filter';
import { GenericPagination } from '../../../core/classes/generic-pagination';
import { HttpMethod } from '../../../core/classes/page-loader/page-loading';
import { ProductTypesService } from '../../../core/services/product-types.service';


pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var numeral: any;
declare var jQuery: any;
@Component({
  selector: 'app-dam-pharm-products-report',
  templateUrl: './report.component.html',
  styles: []
})
export class ReportComponent extends GenericPagination<Product> implements OnInit, OnDestroy {

  currency = numeral();

  private _sub: Subscription = undefined;
  private _typeSub: Subscription = undefined;

  product: ProductFilter = new ProductFilter();


  constructor(
    private _productsService: ProductsService,
    private _productTypesService: ProductTypesService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) {
    super(_productsService);
   }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
    this._utils.unsubscribeSub(this._typeSub);
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
      this.product.created_at[input.name.slice().replace('date_', '')] = input.value;
      return el;
    });
   
    this.page=0
    this.product.page = this.page ;
    this.setPageParam(this.product);
    this.setMethodType(HttpMethod.POST);
    this.loadPage();
  }


  loadProducts() {
    this._utils.unsubscribeSub(this._sub);
    this.product.page = this.page;
    this.product.page = this.page;
    this.setPageParam(this.product);
    this.setMethodType(HttpMethod.POST);
    this.loadPage();    
  }
  

  format(): string {
    return this._utils.format;
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
                text: this.translate.instant('table.name').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.type').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.sku').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.stock').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.cost').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('form.label.selling-price').toUpperCase(),
                style: 'tableHeader'
              },
              {
                text: this.translate.instant('table.status').toUpperCase(),
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
        item.name,
        item.sku,
        item.type.name,
        item.stock,
        this.currency.set(item.cost).format(this._utils.format),
        this.currency.set(item.selling_price).format(this._utils.format),
        (item.stock > 0) ? this.translate.instant('text.in-stock') : this.translate.instant('text.sold-out')
      ]);
    });
    pdfMake.createPdf(docDefinitions).download('products.pdf');
  }

}
