import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import 'rxjs/add/operator/switchMap';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { isObject } from 'lodash';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../core/classes/order';
import { UtilsService } from '../../../shared/services/utils.service';
import { Bill } from '../../../core/classes/bill';
import { User } from '../../../core/classes/user';
import { AuthService } from '../../../core/services/auth.service';
import { Http, Response } from '@angular/http';
import { Invoice,BillTotal, BillDetail, BillTo, BillFrom } from '../../../core/classes/invoice';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var numeral: any;


declare var Stimulsoft: any;

@Component({
  selector: 'app-dam-pharm-orders-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {
  private _findSub: Subscription;
  private _delSub: Subscription;

  private _sub: Subscription = undefined;


  order: Order;
  user: User = new User();
  currency = numeral();


  viewer: any = new Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
  report: any = new Stimulsoft.Report.StiReport();
  dataSet:any;

  /**
   * This Method For report Options setting
   */
  initReportSetting()
  {
    let options = new Stimulsoft.Viewer.StiViewerOptions();
    options.appearance.scrollbarsMode = false;
    options.appearance.backgroundColor= Stimulsoft.System.Drawing.Color.white;
    options.appearance.pageBorderColor = Stimulsoft.System.Drawing.Color.navy;
    options.toolbar.borderColor = Stimulsoft.System.Drawing.Color.navy;
    options.toolbar.showPrintButton = true;
    options.toolbar.showViewModeButton = false;
    options.toolbar.showAboutButton=false;
    options.toolbar.showDesignButton=false;
    // options.toolbar.viewMode=Stimulsoft.Viewer.StiWebViewMode.WholeReport;
    options.toolbar.visible=true;
    // options.toolbar.zoom = 50;
    return options;
  }

/**
 * This Method for init Invoice data
 */
 invoice():Invoice
  {
    var invoice=new Invoice();
    var billFrom:BillFrom=new BillFrom();
    billFrom.name=this.user.username;
    billFrom.email=this.user.email;
    billFrom.company=this.user.company.name;
    billFrom.city=this.user.city;
    billFrom.phone=this.user.phone;
    billFrom.website=this.user.website;
    billFrom.state=this.user.state;
    billFrom.address=this.user.address;


    var billTo:BillTo=new BillTo();
    billTo.name=this.order.customer.full_name;
    billTo.company=this.order.customer.company_name;
    billTo.phone=this.order.customer.phone;
    billTo.state=this.order.customer.state;
    billTo.address=this.order.customer.address;
    billTo.city=this.order.customer.city;

    let totalSum=0;

    this.order.productDetails.forEach((item, i) => {

      var billDetail=new BillDetail();
      billDetail.billNum=(i + 1);
      billDetail.productName =item.product.name;
      billDetail.productQty =item.amount+'';
      billDetail.productUnitPrice=item.product.selling_price+'';
      billDetail.productAmount=this.currency.set(item.product.selling_price * item.amount).format(this.format()) + '';
      billDetail.productDiscount=item.discount + '%';
      billDetail.productAmountAfterDiscount=this.currency.set(((100 - item.discount) * item.product.selling_price * item.amount) / 100).format(this.format())+'';
      invoice.billProduct.push(billDetail);

      totalSum = totalSum + (((100 - item.discount) * item.product.selling_price * item.amount) / 100);

    });

    

    var billTotal=new BillTotal();
    billTotal.subtotal=totalSum+'';
    billTotal.total=totalSum+'';
    billTotal.createdAt=this.datepipe.transform(this.getCurrentDate(), 'yyyy-MM-dd');
    billTotal.billNum=this.order.id;
    billTotal.other='';
    billTotal.description='If you have any questions about this invoice, please contact';
    billTotal.commentTitle='OTHER COMMENTS';
    billTotal.comment1='1. Total payment due in 30 days';
    billTotal.comment2='2. Please include the invoice number on your check';

    invoice.billTotal=billTotal;
    invoice.billTo=billTo;
    invoice.billFrom=billFrom;
    return invoice;
  }

  constructor(
    private _routes: ActivatedRoute,
    private _location: Location,
    private _ordersService: OrdersService,
    public translate: TranslateService,
    private _utils: UtilsService,
    public datepipe: DatePipe, private _auth: AuthService,
    private http: Http
  ) 
  {}

  ngOnInit() {
    this.loadOrder();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._findSub);
    this._utils.unsubscribeSub(this._delSub);
  }

  /**
   * This method to load order
   */
   loadOrder() {
    this._utils.unsubscribeSub(this._findSub);
     this._findSub = this._routes.paramMap
      .switchMap((params: ParamMap) => {
        return  this._ordersService.find(params.get('id'));
      })
      .subscribe(
        data =>{ 
          isObject(data) ? this.order = data : data; 
          this.generateInvoice();
        }
      );
  }

  generateInvoice()
  {
    this.viewer = new Stimulsoft.Viewer.StiViewer(this.initReportSetting(), "StiViewer", false);

    this.viewer.report = new Stimulsoft.Report.StiReport();


    console.log('create new DataSet Object');
    this.dataSet=new Stimulsoft.System.Data.DataSet("Demo22");
    
    this.user = this._auth.getCurrentLoggedInUser();
 
    this.dataSet.readJson(this.invoice());
    

    this.http.request('reports/Report.mdc').subscribe((data: Response) => {

      console.log('Load report from url');
      // this.report.loadDocument(data.json());
      this.report.loadFile('../../../reports/DamPharmLat10.mrt');

      this.report.regData("Demo22","Demo22",this.dataSet);
      this.report.dictionary.synchronize();

      this.viewer.report = this.report;

      console.log('Rendering the viewer to selected element');
      this.viewer.renderHtml('viewer');
    });

    // this.designer.onSaveReport = function (event) {

    //   var jsonStr = event.report.saveToJsonString();
      
    //   console.log("saving a report:"+jsonStr);
    //   }

    console.log('Loading completed successfully!');
  }

  onDelete() {
    this._utils.unsubscribeSub(this._delSub);
    this._delSub = this._routes.paramMap
      .switchMap((params: ParamMap) => {
        return this._ordersService.delete(this.order.id);
      })
      .subscribe(data => this._location.back());
  }

  format(): string {
    return this._utils.format;
  }


  getCurrentDate() {
    const date = new Date();
    const latest_date = this.datepipe.transform(date, 'yyyy-MM-dd');

    return latest_date;
  }

  async save() {

    let columns: Bill[] = [];
    const rows = [];

    columns.push(new Bill('S.No', ['itemsHeader', 'center']));
    columns.push(new Bill('Product', ['itemsHeader', 'center']));
    columns.push(new Bill('Qty', ['itemsHeader', 'center']));
    columns.push(new Bill('Unit Price', ['itemsHeader', 'center']));
    columns.push(new Bill('Amount', ['itemsHeader', 'center']));
    columns.push(new Bill('Discount', ['itemsHeader', 'center']));
    columns.push(new Bill('Total', ['itemsHeader', 'center']));

    rows.push(columns);
    columns = [];


    let totalSum = 0;

    await this.order.productDetails.forEach((item, i) => {

      columns.push(new Bill((i + 1) + '' + '', 'itemTitle'));
      columns.push(new Bill(item.product.name, 'itemTitle'));
      columns.push(new Bill(item.amount + '', 'itemTitle'));
      columns.push(new Bill(item.product.selling_price + '', 'itemTitle'));
      columns.push(new Bill(this.currency.set(item.product.selling_price * item.amount).format(this.format()) + '', 'itemTitle'));
      columns.push(new Bill(item.discount + '%', 'itemTitle'));

      columns.push(new Bill(this.currency.set(((100 - item.discount) * item.product.selling_price * item.amount) / 100).
        format(this.format()) + '', 'itemTitle'));

      rows.push(columns);
      columns = [];

      totalSum = totalSum + (((100 - item.discount) * item.product.selling_price * item.amount) / 100);

    });


    const docDefinitions = {


      header: {
        columns: [
          { text: 'HEADER LEFT', style: 'documentHeaderLeft' },
          { text: 'HEADER CENTER', style: 'documentHeaderCenter' },
          { text: 'HEADER RIGHT', style: 'documentHeaderRight' }
        ]
      },
      // footer: {
      //   columns: [
      //     { text: 'FOOTER LEFT', style: 'documentFooterLeft' },
      //     { text: 'FOOTER CENTER', style: 'documentFooterCenter' },
      //     { text: 'FOOTER RIGHT', style: 'documentFooterRight' }
      //   ]
      // }
      // ,
      content: [
        // Header
        {
          columns: [
            {
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAABlCAYAAAB3J3waAAAgAElEQVR4Xu29B3xc5ZX+/71tmqRRtyW594Y7tjEuYM' +
                'BgigGb0JJQQ0gCSZYku5tkk82ySfa3KUsS0ghphOKYHoMpBtvY2ODejXuXmySrjzTl1v/nvCOBQwDjwv7JRvfzkcfSzL1z7/u85ZznPOe8WhAEAad5yCXkR9' +
                'M09fPu44Pef6+vP/4aJ3pfvuvdn3n3PZzo/Xffr+/77/ss7/V98rcPuucAGw0fLQgDutwxgeYiDR9gytkYf9tsp4kKaKcLrjScNEb7A74b4OPfl8/ouv43' +
                'DfHuxpfPtB/tHeP4Jz3+ffm74zjquu++dvs58r7cl2EY79n53q8V27/73d/X/nnP89Szy3Xf6zPt7+uaj6GeKQukQIrmCcRvg6t/HMF9d09+v5Hb3iDv' +
                '9f5pd9HjLtA+g3wQYCe6hw87ct/vOu2d9e33ZXLM9v8stgrcQL28/cfjOvSZao/THrnt4H5cpuX/zc51/Izzgd8baApLNJ9A97KgBjqaIB34WaB160x' +
                'h+vZ1ThvcE62JH/X7H+XM8Tcj8F3N/+HBBcf2MUI2LhnAwNJi6IEOgYMa1kbk4wfuGb+j/4MX9AOwXQdPb6C64RC+Y9G9bBAmJrovYHtgxM74k5/2yD' +
                '3jd/R/8IKeGH1BkqR3hJcXP8/oEefTrfgsQoSwAgHXBT3njD95B7hnvEn/9oJiFydpZPPexbyx6jWum3EnBeF+RIMIITJoAq7WAe7/AhSn8BXK6hW3' +
                'xmuzhnUC+a/4/JpPWstwKLOduQsfwnc1Zk79HJ2jfQkFBob4v4h7KG7SmT06Ru6ZaE/l5ngEmtPmxlp4MtPqoGsOjXoDz7/1GFv3LCYWdOb2y75D' +
                'WagrRmATYOFjYX5c/dwz0T5/19f4K3A1Al9GoY4fOBiGy86mLcxa+gAuNZhuATdN/To9c/pjBZoiMYJACJgz3wIdI/dMtGkbuFnWSQ6TAJ2M10yg' +
                'tfLK+ufYkVhDQ/IghpvLNRPuYkjJOCLElL8rp39sGaoz0T5/19cQX0cZRbLu6vi+TmAIo9zMkYYdvLj8SVpyaqhrOYLmhLlyzC2c3WUqsaBIERmK' +
                '3+iYlj+uXUDGni8RDAJfw/XBNRxsvZGX35xNs3WUvQ3bcTUb3IAhZeOYOepOYm45pmYQ4KIbH0OG6uPa3P+799UGri/RMYNA10kGLTQ6h3jspZ9T' +
                'MTCP9XvXE4R0NN+hzOrKzZP/lUK/HyFNR7eEpYqe8VvuWHPPSJMKTeG3DV6DQNNpoZndtWuY++YjDBrTlTfWL4dICC1oJcfJYcbIuxlRNg1T+UytaH' +
                'rRGbmT4y/SAe4ZadJ2cDXwDVx80kYri7c+x5ZDS+h5VinLN67CNcTQSpDvRzgr72KuPffL6J6N7bYQiVa8fSfZ5ff0F+EOcM8EuNnlNhvt0QI8I0Myq' +
                'Gfem09RndhLt6FxFqx9mVBevgrVh9NQlC7ljqv/hVhQgW7k4RN6B9wADM3IRo3UGad2dIB7au32V2c5gat+F75J14RMbKXVr2Xum09RnzlE14ElvL5u' +
                'MUEshOf75AYRchN5fOrCO6nIH4kp1KOWXbezUGbDgdmx2wHuGYDo1C/RErQSaAFhhCs28YI0Ga2JuaueYl/jNs4a1p9X3ngVCg1SXpocLUpucyE3TPw' +
                'sfUvGEtYsdBXwbYvft83I2Rdxr2SSPnmQO0buqWP69pkJWlTjSyBAdwUEnxT1bKlZy6JNr3DuxGG8vGgOiXAzGdMmEuSS39qJO6Z9hU5WX8JBX' +
                'lswv+2Sgmr7D76CV8M46TvtAPekm+xvT0j5KXQMQoGFZou6IiCjJWjW6pmz9ClGjOjNms0L2d20Ey/qoWcijKqYzIwxnybs5WMQJfB1NN3A9wJ' +
                '0oat00CSWHwjr5aFr4gefnJHVAe4ZANfzfHRNR3N9Ak9UFT6e7uDqNnuO7qIlWU/GaGTppoUkvRS9yoZw4VlX0T3eF02BKjSGQ+CZGG0gCmMlfHM' +
                'gf/cF8A5wzwBUJ38Jz/YIxKgyXQLdIR0kCekhbM8lbMRI2C24VpodVRuxNIveJUPJ17qgewa+YZPRmrF0gyCwFMAhPaqiRDKAA5HhiGy4A9yTB+Z' +
                'MnOFlbHTLpzmoZVfdFo42HCFEmN7lA+iW25uGoIGFm1+gqmovA7oNZMrgK7C8Yqobj3KwdRsJu54uhf2pKOhB2IyDZxIxxDQTe0o6jtcB7pkA6m+u' +
                '8bb/2iZaVLJjEeCL3ZS1cF3dpcGrYuHGp1m/fxkONoYTJTcoYdq507FyPWa/9lui4YCIF2PG+bdSljeIt/Zu5a1DK0ik60nWanQt78KEsZPpHh+IQQ7h' +
                'IIQufLXnopnWyS65py9K/0ga9ON0UcFPQJT1Twgo+YcA28sQMU1816PeaGTOpllsPbAYPbeRlJ0kohVgpPIoiXVj2NCBLFkxD89NUxAvYtyYC2lu0Em' +
                '2eBQW5lNcmseufVs5VLmVumNVzLj4ZgZ2mkScCnQ7QDNAM8TCOrmG6TCoTtheEumx0cR0VYF1DUmwkJCe6ztqlC7c9QhLtr2MGYuQ8pqwojZeOkPUK6P' +
                'AHMyNl9zE5m2r2Ve5jwFDenHo2G627F6HFZFAoUvgxxjS71x69yrlrQ1rqd6X4Lppd9KzaCi5xHDTaaxItAPcE2J10h8I8IOkAlfzwuDreH6Abbm4Wpr' +
                'tVVt5dsX/4ERrsX0NKxzGc22sIEzQEuPyyTdRqBfRvbAbmpZLigSPvfIzauxN2GYTnhXB8IoJ2QWEwx4jhw+j4VAriUNw81V3YTpR8qxcDP3kNVYdI/c' +
                'EYAuB4AQZjMDECAzwNLA8WmlmT8sWnlvyFLX2AbRIAsxWFc81g1JoyeWcYRMoLcqjYddRpp9zIxkvTisOTy76OQczy8lE5LdcCGIYqRZMS8MINPp3H0qy' +
                '2qQ8NpCpY2eiuSHyw7GTnZU71twTDWSlsWhL7REjyvMzuHqCnQ3reHn1U9Q6B3GEVTZNDCONazvkWZ0YNXACBaF8Vq1YwqVnT2NYxYU4Ti5p02PJ9mdY' +
                'tvtx7GgLrZ6lksiiZiOe6+N7YPpRhvQeR/VulwvH3UDvToMpRMDVPjCb8t3P0jFyTzhyRdfok/Js0B0SXg0b9r7Juj2LqXcrCeX6pG0D3cvDIEa/7r3' +
                'oWVFKU80xtq7dxdB+E7lo+EzifjkuGl44oNbZwwsrf8v++k2k/AyxvAiZTINydzRDAPTx0hrdS4cT8Xpy9aSb6BSUZIkSTVNZjZZ1YuVGB7gnBFem5QQ' +
                'pv5UDzXtYtnMx2w+th0gKI+Siay6RSCGlRT0pK+hCY3Ut1fv3omUCRg2YwpjB08k3yrBcDS0EduDh6Rnq7YNs3PMmB6q3U1N/JCtND1wCM4Oj1RO' +
                'K+Oh+DqGgKxePuZFzSy5oY6p0JDXUNE+8BneA+yHAbUjtYsXWpazavZymUANuVEaxS0FOnBwjiqHHSSZbSDQcpDCWR99Owzi7/zQ6xwbiO1FilozG' +
                'JuU+WVYujh/G0ERW45MMamnM1HIs2UhNXRVHm3ZztHk9zZkDGKZBOhGhe94o7pz4b+RG87LZveKZKes9Szdno0Z/e3SA+yHAramvwtFsMl6SVJDC8' +
                'dPKDfIcF9f1KTJCRHJNgsIwup5DrqyQfi6mJ4Jzj0bH5L7fP09t0uHi8ydzxbguxB0XfIcW4ZZjIUS/0dzaQn5OLrYwXTXreWPDC1Ql9qEHYWaM/z' +
                'IDug5R63GIKHpgKsmkr0tYwVNJZe8GuAPcE1lUbSOlPdrqqxCch68F2TAdPkag42qQ1FwVZo8GGpaj4Rth6jI29/7sKV5bW09aD2MFLdz/9U9y2ch' +
                'SfLsJP1pAK2AFrRhBCM0zsSwDT0vT5FWzsXI5azeupCjSlaumXkueUYBmhwjpEUU+e7pYBD4mVge4HwLLv/mIL9Ge9jR4lUCtSF/FWMmR9EwyvkaOA' +
                'U5TivyQixa4eLF8ttUk+cI3H+FQYxxCYWJmC1OG5PDDr11DWGvGC8VoFVbEzpATysNLO0RCEXzNxzdc0iRpSTXz8mtzmDh6El0LexAL5aP5Qlt1gHs' +
                'qeP7VORLGy651gRq32QSvbEUL+V1C9StWbiXq53Hu0N5K9GbGHDJGiK1HUnz13sepas3H0zw05xhXTuzFvXdPJ2IkcXWDFtfCcDWWvbGOwlyL8ecMw3' +
                'dtbD+FFbJIeklanGYaa5vpU9EP39GIWDE1cmUG6ZiWTwfitgBB+yVUzQxdz45mTSMdJGhp1fj1z5+nML+MGz81iUiOiWX6eK7Orx5ZzJPzN+B6NuVFEf7' +
                'r67cyrHcBuB6BoVNdl+HXv36GbhUF3PzpywiZGSzTI/DTeL6Hbhg4Wpb6NANLxXxFHKDWXOlkga8EdR1+7qmA3Fatp90mlelYYvJqVtaFWmhGFF' +
                'SVR12+d9/jpHWfr9xzPb07xchxUnhWDgvW7KKhro5RZw2gd9didOkwgcbuvUe47/7f0KVnBV+++w7ycw1COEgFHDVbyJIgfLYp3yN+roEmNTaUVK' +
                'O9Zko2DbQD3FMAV+Kp7QtsIKNFNa4qdqBKFQWah+frkhTC7sMJvvHfD2KYOl///KeZOLgUO9WEEcsj8F0sM4zrabRkAjZvPcR9P32Q/HyLe//z83Q' +
                'qKcEKdAI3owykkC50J6jUXTHg1HJw/AO0l8OR1w5wTwFaCfNJ7m3WqRSpmu9nk7dkDXZdj6WbaslkMkweV0HINFm6/gjf+f4fKC6I8+17rmfsWeX4' +
                'XhNh08L1DRKOwaptR/mPH/6KcDiPn/73N+jbWWfdhj3s2LaTi86fTNeKXPACwmaAkxH/WAqiaFldlVoOskbdB8lfz4Ar1F5gSdag4w/R8nptqr3' +
                '3YVPaRNzZMfBOWaa/nmLaouViorY57tnvacvPUQ8ovTa75rzzXhaM7I8Qf9meLVl4KkSrzgtUZrv87Z2en303e6Xs37OJmdnnVKmZGQ8zrKvp8s' +
                'UXlvOtn75MXmGce24bxycuOxuPKLOf28FPfvkU3XsW8oN7b2Fotxh4SXwjh42VtXz5m78glUrxxS/eweTxA7FrUtz1lR+SchN0Lo7y4P98n5L8DL' +
                'qRxHFQ8WGlEFA69Tay+23y4r1lr6cNbuCk1XTh6yE84T2VmMvD0NJACtwcDFWpRRrRxfEyOJ6LFYqgSZRFyuRpSdVsDq4SbUt4yySs3jeFBnAS' +
                'eL6FacUx9Ui2KwQuyVQD0YiFpcu1wqrhPTEwJMNdgWFK4BVNru/rGL5GRg8rVyYdCAQugZPCUKPCUp9V4nCtrQiJ/E4YuQu5v9qGY9TVBvTq04nm' +
                '9DHyYsX89H9eZ86iSoKQxxVTyvjnuy8grENds8X371/C65s20atXDj/9+o10LYQddRrf/MnLVG45wM0XDObuu6eJqoY1byW45Rs/prB3MU71Hl777' +
                'S/oFE4TRHQa0iHqD++iV6+einZsr1p3omnotMFNi2GgSfqDjA0JPIvlZqrQl6j2fF3DFZ9NS+NpzaT8eupTVTSn6jlad4REaxLb8WluTpCxHbR' +
                'AV+dHojlEwzmE9DBFuUV0K+9CYTyfolAhUQmT2RF0L6LKOGm5AqaMSMnFkf+2jzwp7iXj0wFHQ9fSBEaeCtehxzH9NCHfagvEty9m7aNCZh6ZA8' +
                'WAyRo1XhCwaNEmtmzfzm13XoOvW1Tuq+PffzhbhQG/cc+1DO1fjjAaL766hu2VSZau2U9Nop6rLx3K3TdfxI9+9RJPL9jIwC6dGd83ztSp' +
                'o+g/pDem6/CrWa+xaNk2rrliPLdfMxrTD1i9/iDPzZ3Pl+64gvLyMjWQXNclFHon/eT9QD5tcJtVWjhEAh/Tz6DJ+uTp+FpEZbtljBYSwWFqGo+wv3o' +
                'Hh+v2U9V4kBY7gS+kux4nTy+hqKiIaCQH0wiRE83F9yTP1cO3TewWkaQcw043kBcO07W0B8MGjqcw1gNNiDdTxrKAICO1LQ1DLElFIfl4voPpmvh' +
                'mLb5fSHVqL5belfzcMGbKwhCZYZviXzWUSu1oPyRYn8EPTHQtRNoNeHTWy6xdv4t/+4+7yC0ySSTSuJ5LSVEcLwO//+1fqGk8zD1f+yzzXqniF7NeRY' +
                'sHTJ90Hi+/vAgjqvPVz1/BkO5Rvv2fP+X666/nyvMHE/geLYmAvAK5V5cX563gL0+/yff/8076VhRkB45h/O+N3KSf1deGggDdl+xyl4yfxDN1mtwW' +
                'ttUsYXvlCmqqj2FnpKEM8nKK6Nq1D51Lu9A1pxudwiXkRuOYgaRiyCiXqqnZtVGU9gYWjt9KY8sxGltreGvPW1RWHabfkAEM7juMnpYIynT0wEL3' +
                'LfDbRqFQc7pwPDZh3yJtHIR0Lo8vfZize19On969iEqoTumjZPRLJ2lPvmq3h101YqWACXoYT2vE9Uv5wQ/nsL+ykW997yYqimXtNiAwefA381i1e' +
                'jn33f91cnIjZFp0vvjdZ9l0tJWIGyHi2QzpF+YH//kJ9CDDxu1H+P4PHuazN8/k2suHgO2QckzmzF/Nw4++wHf//R7GjSjFEpFcW1Xc96uOe8Zd' +
                'Id+zVafXPDEwfIKwQwNH2V27mUWb5qmKadFwBMOPUVHYk0E9R9Kn/CzyrVI03ySiRTCFSpMx5vjohpQccPF1h5SfpKb+kFI4xGPlxEJF2L6Pq6X' +
                'Yc+wtFq2cqxicGefcTmm8SNWY0N0cAjuMIby6laYhVckbuzZSHi/AKrYpJM4fl/6ZCwZdTm5BIX2K+tHSkuRIzX50I0NJSSdc26S5OUleThj0F' +
                'JlMGNtpJZ5XRFOwmVhoNHrQl6/dM4toPOBn/+9GYrrO47PW8uzcOXzne3cy/KzuysTTvIDH52/nvkfXkWkNU2xk+ObnzuXyqT1wA5tWN8xT83bw' +
                'x6fm8t2v3crYocXs3lvD1/75Aa6//kpuvWE0Ec/HCv3/kE7itTahmwaO62DELKrtIyzZMo8N+17HDjUQ8iroWjCSYf1H0L98AHHyVbqUdAbN9tUIz' +
                '1jCt8iaGJD2W/C1JPsTu1i6bhE1zZX4QSMlkQFcOek2SiO9VfzDIkVN83ZeWPgX6tMeMy67nPKCCnLojO7G8MUWsBp468Aynl3zOqP79WNT1Q4u' +
                'GDSEOdvWMCSvC3tr6rh52nW89PJS+g7qzoZNSzn33Mns33OM1laPeL5FQ3MlmdYcijuFaWmxySk5RrKxB1dfeDfrNuh8+5v3c+st5zF0wED+370P' +
                'MPWSIXz5y5JUHeA7HpGQzc6jHp++ZzZOqJQCrYlnfno7JbmtZMTIDOXSYPvc+s0/0FRjcN+Pb+EnP3oAu6GV2X/6Jnq6GdOJE8o96WyS05fZBI6j' +
                'ONAglGFvYjsLVr9IVX0lHjbxvFwmDb2WwZ0nEZbClX5ATA+r3qwm3cDD0Vwc08QNMirwbQfNbDyyitc2vkide5RIzMTMxAgnC7nhgjvpVzQCy9Z' +
                'x0zZmbkAiXcODrz1AuqWO6y+9jvLYIHKMMrUuaWYN89c9TbWuc07vfjyxbDmD4x47zTwu7F3C8m0HGNqpnH0H00ycfA7PzP0jV105k9cWruOsAWPo' +
                '37MLzy96mOFDJlJVvQUj6ExRZ5eDuyNMnnAeZlDB/T9axeKV68kvjBOinl/95AsU5epEZK73XUwzQyId4fZ/nc3m+hRjBnbiD/82AyudIojEVBqJ' +
                'H7gsXFvHvffNJVTQmZrKtfz6u3dy0ehOBK6DnckhkiuW/Ins479+/7QNqowjAnmXXc3LmLvsYZrdakw/RN/OI7lk9CcoscrA1tD1CIYewfUCZcA' +
                'o9k2izpJorItl7YKRYv3ON1m06QWaQkdpDh0j1ypiUvl1DB84nM5WuXKR3EyAGQqT9KWoSJrVx15h1bKFxIMcrr3gTkry+is7IB3s4bnXHibeazD' +
                'FesDi7Y0MiFTT2GUsZZm3ONIaosJ0qW0uYOSowbww/1Gumj6TOc8uZcb0TxOOOcx++ufMvPJ6Frw2m8ljb2fLlrV0K53IgMERTLqxdY3P13+0gC' +
                'annls/2Z/PzJhCXNeQyruYtvJN7bTFfz/0Or9b/Aa3Xn8R37hqLDFb7k/DiKQJOSkct5Bbv/sAq/a5DOhSypM/vQFqGokV5allSSPvpIfuaYMr4' +
                'rEmbRe/eeX7tGhJmqp9po2dzqS+55OrdcIMwirRSVUdb2N5xGkS10IZptIIgUbasDmQ2sLsV35GUj9KyAoR2AVccvb1jOtyASFZRNv4DOFXFVO' +
                'kojI+jW41m7e/ypLNc+nSZzDTx91Fod0Zx9jD7+d9D41+uK0ZRo+/iLdWLmTYuReTrNnN6o3bqCjMo761kYquZVQe2ENZeRdqDie4+VN30Jp' +
                's5uln/synb7yZp558jJlXfoZ169bT2qwx/dIL0I1cWppMPvetJ9hz6BB//s0/MaA8TzzmLJelYr4amUDnkTkrePDROXzlS7dx1fn9CYvvrYkh' +
                'ZqLb4oZHmL1kG/feP4sv3XYjd14xhKhv4xkmacMjpslidHJD97TBTdPCa9seZvm+uTQmDSYNvY6Jvc+n1CrEcCJqdcxaFkJWtAe4s4BmQTaUr' +
                'uhwZjePvfYLWkJ78INWYl4Fl4z+LEM7TSAugekPOCRyUtuymT+89kMaQymuHPcFzs6bRF1yO7OW/owLx9xBzIpTml9CQ3M9RfECfM+nobGe3N' +
                'wcGpJ1FOYUUpdoID9SQNK2KS+uwPMCqmqq6VFexpGqQ1R06qbUEnbGp6ykCynbJRKK8vUfP8umrft59JdfpVOOZNc7yg1UPnuA0ke9tmIH9//kIb' +
                '77H19j4IASrFADJg5mkA9uCE+HVfsS3Pbl7/Dgfd9jQv84IS+Na1hkdIPYu2nlDzFDnza41d5+Hp3/A6qTu+nVdQyXjr6VzkaZcsAtTTS5gmxbNfA' +
                '2fvCd/heQIaDBq+W5N3/H3saVeFaCmF7MpWNvY3DRReh2jLzwB/dY8TEDrZHHVz3AuuqVDO06jhuG38bOPTtYsn0hn572T8RCefi+pww3OYx2KjOQY' +
                'mCinzBwPIeQGcLxPHRhyQxDhdwCL0HUssg48r502KwwXfI85P8PPLWKdZt28vPv3UJYLTNyPwKu6JBlVdLYfuAY3/3Oz7nvR/dSVKQTDjVh4GEE' +
                'eSrxK+3ZVNkw86Z/5bnZP6ciDGaQwtMMbN1CvvXkxu0Z2MBiefUrzF3+O7wgxSen3kPvnHHkSNk74VHNqCp/J8ZTNkz1DjGQLYTp0xQ08uKWZ3hr' +
                'z3xsasiNdOKScbcyMH8SEbeYiKEhwZH3O1TAPHDxPZfVR1/jqXW/JUc3+MKUr6FliqlJJRlSPkxVJVdRFUniatP/Kv5d1ntNriFpkvK2xGo1Bar4' +
                't4ahK+tc9FKGaSkiQdcNxRLJA5mmxfy1h1mzcTv33D4VS52frSQnHzCV66ZR3Wzz85/8gX/957vIicl1k23gxhSbZ/suzb7Ol77+Q371k29TIKwf' +
                'SXzNwJEIkeqAJ3ec9Mg9foMIsUif2/0QSzY/Q+/yXlw77p8o8nojci8fyUkNK7LfVIxetifL4cl41W31uvrgEp7f9AhBkCAnFGfSoGsZ0u0SCoMST' +
                'FfWLUmPlC1b3vsQHUJGmDE7xFF/Dw++/h0ydhU3nn07w8qn42qFhAUkTSShvgrFCS0qIAnYWSWhAC56BjHwfJV4JR3mbZ6eHFxHgMwS9J4nFd+EK' +
                'cq+vlWZYPuu/Vx+/lAsVRhbx9dNxe9LnSkJn7Q48OLchVxx+YVSjgpDd6SQIDrSYbJCtxZX46E/P8sdt1xLRAU1Usq2kPkmq5E6OXhPGlwBtH' +
                '2bFRFHP7fjt7y+6TkuHHcJk/vcSDxTjimyeSuDbYazE540mKpkKiPCIbBsWv16DtTu4qXVs6g39mHaUaaOuYHBZZeQ53UiJAnqRkaRCJpERN4' +
                'XXBcpWxB28zjq7uc3S79Nyq9kYsVUrhj6RTwKMbRsXcb2Q4ITypjLpq6LSjXLUknzKRYoa7m5og+W7WqE9Tr+aA82tW3JVJP0aGlN07VEkqZ9PA' +
                'muG1lwBWzH8/G0ELXH6inrXKgSyUw9C5t0euU56B5uYFF5pJoeXcuys51k1asAiCwaoY8e3ONHroijFx34M6+ufJqpk2YyvOISijxZb22w0riq+rf' +
                'cmICrrCpV/7BVa6TRO8LseX8k4VXj2C1MHfcJRnWbRm5Qju5kp0jNEhfAQyf/fcH1cEmJAZaJU6dVcv+ifyehHWJU/FxuHH8PmluMbjhZOUrbVbKYZ' +
                'Meq/F2pDmXfIWloqdtoe0SsLDjyWaVgaYufvu1stg0imQEyEjSRadTLZN08zcLWlBCGUOCoa/hKJuOp2UC90+4tCHwiulP2SICuGWRsFzNsKZVl9vl' +
                'lhMvs9RGP3HZw2zdUqmY9f/rLr+jfdzRTh99K2BX+yUYzJICXq3qboZQMUjZPU35pa1DLsysfZXftJtLNaSb0n8bFo2cS9uOEVSdI44n+SJMH' +
                'Es/2/RfdLLgJcjIxavx93L/4uySMeoblnsPN534By89B17N1FdvVijJyZQoW3ZE0bDqoxxVO3HZUdl48XKjCjYGjYRlSy1GdfVzjtrlxGkq37' +
                'GoBIemMfjo7Es2I2gPsHXAl3TNAkgRk5nMdCcK3bVgh671cxw/QRIFhyQxn4oktoFZuRzl9HzG47Snm7durZQ2U5qCSfdWbWLR0BdddeRcloT' +
                'Kh+dVa6QfyAIEaAQKur4u2t4k3977C0rfm0ao10a9oJDNGfZYCqxMRmYycJrRwCk8XQ6JQPegHlbwU1W5SuU4ah1u38sCS+2g1UowoHMcnz7lV' +
                'lQXCEwIguwuXdH5frh3IaHY4Ur+PpbtfovrYAfSMT5R8Rgwez8iBE5QZYyohWlT50zKKxMwJZJqW62gBdtBKS7IaSw+RHylWsQfdCOMp0bh0ih' +
                'Za7Aaq6o6Cm6FnlwGEgqJsWFTdj3Q0SDgJcizRL0vEUJaBXEWAKPGOGvES4jvDI1f2NFIyTlm3pKphINOEhRaEVAaVwJwAABaySURBVB1/ZYMY' +
                'Dkeqd6pJpGv5wGwMVNUfblTrl+fE0P0YKSPJrvRynl71W1LJFCV6f64dfwd9CwdmJSRvKzPapqm2EftBjySnZBRB0sjaAy8zb+0zeAYM6T6e6S' +
                'NuIO6XgicWTFpx1jIV27rOoWQlb2x5gb3H1tFo5hDKtNDZCIjrpbiZCiZPuIHuBV0plHg0cTQthak1oPlRXLuAtK6RtOpYtvvPbNn+Ir3KJjF5' +
                '9F0UajlEnKRy4TJRjZX1L7F05wvUNxwmknKZfvYXGNFlOoa4ZeEGUthksNhav4rKyi2kmpsY1ms8A7tPJOIXZ6XmvodmfAT0o7gGWQH2u0au8uPE' +
                'cpQRYKu1RjZh0JRHJvOYdIZUVpqpR9W+OvXuIZ5e9Uf2Nm4jHORy6cjrOaf7RUSkl57qISSBF+CYNby04SE27l+JE2icP+Iqzut5BVEnP1vfCeGx0z' +
                'h6I9uOrub1da+oQiMypRbk9eKcwWPpWVKhCpdsr9nJ0mWridOZa6Z8ki75fcULVgCrTk2U1sBly7E3eeGN3yjZy6g+l3DJsBsJuZIJkCbhH2PlrqWs37G' +
                'MOr8SPRYQd8qYPvZaBnUahUkBtu9Qm9rFgvXPsrt+J4GbQrcNSqJ9+fQVX6bALCdwxKiTWUdmizM6cmXWzyhfVTZakNHl+D6m4WP7CWVmVjXsJjdWSF64A' +
                't+1VBUWXaYbFScX2YvYfClsrYr5W/7C2r2ryLg6w3uM5+rR1xFycolY8VOFVp1nuzZN+j5mLf0FhxP7CZwoN075PIPj44jYOaCy4KWrpVmx+yVWbp2D6zep' +
                'Bh7WbwpTBl5ImE5kNKjT9/GXlT/jSN1OQukufPLCbzGwsC+G2AKBia9pJP0mmjnK7FceoDazj/zIWdw45S7KtU6ELZMqu5IF219iV+UGxgwczI7KdRxN1DK' +
                'o82SuOueTRCUJzA/YXrmNZZtfJ7+bz87qleiugZHOY8YFn6FP8RhCXg6mWGqeg2ZmBXInc5zAFRJwRd8kjp94XpByxJKTWhANbN2/hkVrn6GkuBczJ32RUJB' +
                'PzBATKqU6BF4UVxc1RgMbq15g3qrHcXSTosgArp1wO11DXTE16eknTkd8/4fKplhua1jG48t+h23aFOhduf3Cr5LvdSEipQ4iLbQECVbsfJNlm+fhW' +
                'Y3kx/KZNHQ6QzpPIjcl6v1cWsIO87c9wYr9j+F6AsZ5zBj7LxRJ4pUXwSWMYwSktSMs2PgYm3YvV2mZU4Z+lrE9LsXyPRpTO3lp' +
                '1XMcsx0mjJ9Ea/MOlqx6inC0lKkjPsfgsnPQ/BbWbVvE5v0bOOf881izawn7jr6B5RQydtA0zut/NWGK0Vwja9B5GXTrjK+54mXJVCROY' +
                'BZcEaDVth7EDCV55Plf0WTtxUvncNuV/0FFZKByvjVhVlSZu1y' +
                'SgcfB1k28sPLXHEvuIax3Yvo5dzK0ZCIRJ5x1D8InTiQ+Hlyx1MUNE4NON3zS/jGeXPV7NtQsU0vDlCEzmNjzSuJaMY5jY5tHWLdvCUs2' +
                'zsPWHXLD5Vwx+VP0iA0gShw9rZM2Muxu3coTix/AtxrI16PccOHnKAsNISz8t23gh3JI62m2VL/C/Dcfwtdd4jmd+cyU76E5OSTNI8xbOptUyu' +
                'eaaZ8nSYY/L/gxKXc3/TuN5/IxX4F0mlWrniewIgwZOZEtda+zfOMTeGmDPp1HM3PCZ8HOI1cvVha454CqkK+JjFZCiKZ6PQPJ1wKuiNbE2JF0xABX' +
                'yyih258XPsjB2p1k4jW4qTDTx3yOsd0uRM/oWIbsTeeSCaQ4bTNPvP579tVtIhI1GdvnPKYMvI4cr5MK2MtaqJ+kyuD4DRJl48O9iTU8suDXZGLNmJk8b' +
                'rngHvrmDlfkgW9k2HRkPguWPYWjN1GQ34NpEz9Ll/BwIkFYyYMyXpo6Kpm97Jccqd9L1CngkhEzmdz/QlXLUX1fOEYzGardfcx68Sd4Ri2WH2HcsIuZ3' +
                'ONakkEVsxb/BMss4RMTv0xMC7HhyOvMWf80uh7m2nOuo2teFxYvfoH8aGfGjLla1cf442tfI+XsokvoHK6ecjudw/1ViqZaR4QSNSWT3seyxKYR1ysL8I' +
                'm2iVWe/Ik2R1aca7bjKNdB4KpK7eORF39PRm8m3ktkl40ML5/IjLNvRc/kY5k6rV4DQaiJV996llW7loEeokdxf26ccCtxrxTNjhJEhDr3sU5yU532/W3l1' +
                'dPTPLHul2w8spK0m+D8QVcwvf9NGJl8nEiGrc2rmffmH0m1NlOUV8Yl0sgFw7C8QkIStdE9mqlj/s4nWbn7BUWX9s0Zw6cmfwkznUM4LOpIQ+1ZkNBreH' +
                'bln9hbs04cU7rlD2bG5FsUeM8v+B3hWMBlE+7G8irQzUM8sezHbD52mCG9pnLRoHHMn/8Q/StGM2HETch2UfM2PsSWo68S2CZXjbiDod0nYni5yNgQnkD' +
                'KNARaCDcwsd613J4ZcNtyYsSRFrGZHTSwaMM8lmxaxKjzRuLnOGxYvZZu4Z58esrdhNJdleresRKs3fsCC7Y+TrOWoihvkHJ7ups9Cacjwi1ih1AEW85' +
                '7JDF9kOHQvpu2KAH3H9vF75f9F61mLbmxXG4afxd9jHEELRb10aM8vup3HGxYSUG4B1OGX8eQsjFImD0702VFA1vrlvPMiodo0qrIC+dz3bmfZWDOBD' +
                'w7jBYykHIYQaiFBdtm8eaeFwmsDEYmj6sn3U636BCeWf0gKbuWWyZ/lVy3L1rEYVP9HJ5b9TvMWAFjBl/E3g176F8xjImDr8bUYtRmNvHUkl9wpL' +
                'mOIT3P44ZRN2MF+ZheBM1NQkQSvJN4Rg6VlbXkRfLoVNrp7ZoYpy1tlTXWFb/WFbZFgs4JmowafvfCzwnpJjdfdjs7MjuYu/BhiowYn5n6LYrcwX' +
                'iezn5vFbNX3k8qnSQvqGD6lE/RI28weX4euq2pwh6eKS5WlvZrP1SEpq1qeJaRk96bwfTjkBGNo08QsWnxm7ENjSfmPcpBfz6kS5kyfAYT+0zGsqOK' +
                '9Vm8fw4Lt/4Z09e5bOxtDCu7BDMdxtJ89FiKVJCh0U7w5Iofc7hpm+LBzx14GRf2uwnLKVGWrxQRExZs68FVLNryJF5uA7W1x+jXdRgTR1/G0tdX0' +
                'Jyp5erzrqe3ORq3VSedX8vDq3/Avvp15OoxcoxS+pedzwWyHClqsoFFe+awdMNcivJ68Ynz7qZHqAumVKzJaARS9ZUWglDAjqq9rFixlqsmXkNJcYl' +
                'qpjMiSleOUGAT8Sy1BqTNBGubl/PUq49wyehpXNL3avYH+/jt89/C1DN8asp36GaOxQkOMnv5/7Dd3kPc6c3Voz9Nn/L+yp+NEM1Gh5TfLGE/WVuEqM' +
                'tyv2pnaMUHvU3zK5/ZCMKQ1hX3mtRbcKxmFu54mZVb54N+mIHFVzNz3N1ERdlgORxO7eWZFQ9SldzC6PIruWjEleQEpYScHDRTV4SKqDSXvvUKKyqfx' +
                'tRcOlvduWbCFygLjyBCjtquzTcaqWut4skFj9N9ZBnbK9fSVF/NhRMupLKynoNH6rl8/PUMLx6L0RrGMdNsS63lz6t/gxPUEk2aDOo2lvOH3U6F3g' +
                'M9SFCnH+SPC35Ps13F5IGXMqnfDCJSq1lRChKw8AksjyOJQ7yybB7jx0xgUMFITFGjnDlwIem7xETJn7HJROqZ9eYf2XN0D3df8890tnuSCCd5e' +
                'MF3aEgeYMLI2xjVdQILl/2IffXLaaUnF4+8jaEVwxU4OaoiqZDssoAEBBKOaYOxfWesLKXfHtwSY8Yk8AICw85mm2OQCTzWHljA65sfI6MdpXNkE' +
                'NPP/QwV4bMIB1E8vYXle19m7trZxEvyuHXcf1GWW4Tvp1V9Cce3cE2HtXtf5o3Nc2gNNaKlI0zodwkXnzUTS2aJwMM3Wjma2MfzLz5Jn5GDyOTrzF' +
                '/1PF3LwpTFC9j/VoKJZ1/P8J7jKKRAgdNq1DPnrVmsPLBIJaH0Dvfm8nE30iV3GHprGCscsD+1gT/N+yW5eXFuuvAuSs0++BI1UzlADmk/QUu6iQVL' +
                'XmbIsEH06NybIrPnO+S4tNGHIDQ+0KBSfq0fEFYirwStof08OOd+yrv1Z+bY28lLFhNENZYfmM3clQ/Tve9EcsM57N/7LKEgxaTh/8LIHtOFjcXSIr' +
                'h2QEiIcRXikpGapTQl1UrR7GoEZ1NA2itpitZKShk7oQBHT5Kgjm1HN7B09RxavUqK4vlcMepL9CrsRYQSfDHUrCaeXvYLNh1Zy9Bh53Ft7y+qAiGa5' +
                'ZLWWrGDJLuPbGHF+gWUds1hQ+Vq4kY3bpz4JXrm9QMnQxBuosGu4eU3XqUgGmbkuHP50+tPUOMeIj/HJnGgjgsGX8v5Q29VM5JwYLbWRJW7m4ff+A1H' +
                'Ww9TLG7fsOsYXXE+hhdGcwNcS2PtoVeZt2YW/bqN4pqzbyOsxfF0i6SbVK5dU7qa15a+wqB+Azir50C18aO4kKrTfwhQ2+e8E4IriV3SwBm3iTp/DQ' +
                '89+0vOPWcmk/pcR8wNk7Y9vOghfvXqvRxKHiMUDWPYCaYNu4xJPW5Bc+Posr76GoYU0GrPxFMhuHdCWgpc6b0qqN+WrdcWLxXCP21CI8eoTK3hpdcf' +
                'xnGShLQSrp5yG4NyximCXrOF884nY9bwx5fupS5o5KIJn+ScvImYeiEZIfqNJg41bubVJc8yfuRkFZ77y6pfMqD7WK45+8uK0TLNFOngCG9sXc7eql' +
                'punDqDg80HmLX0Eer8aiKEGVQwnE+O/wJxrStkdCn7RtKqYnPjmzzxxsOKKhxeMZHrR96B2ZpHOCIDL0ULOiv3v8xrqx/j0vNuZlTnyRiSYG3l4JDmS' +
                'PNh5i+ex/izx3NWl6HorqkiVZjZnKbjjckTsVUfwhUCxwPHTLD+wGxeWzaXq6fdQ8/4ZHIwSXkJjFCSuZv+wJpDiyES4/yRNzCicAqd7RJ0mYZDEu5' +
                'rYyTbAt3ZgJYEqyWcJeaaVAoXrloICg3JcxK5ikzELjZNwVE2HV7KC4sfIxQz6FzQl6sm30XEr6DcKhCtg8obggitHOXRl35Eq5Fh/JjpjCsepVJZjH' +
                'CUbUe28sbqRUyaMIHuJf3YsXcXT6/9Pmf1H8vFw29WdZJjmsazC2bjWDoTL5hGd60HCzY8wbKjz9HoNVJiDeK6CV+ij5AgwgFkTPyQRrN5kLmbZrF29' +
                'wri0SKun3AH/WJnYzkhtEiGJM2kNYPNR99g4dJZjB95Kef1u0xMVWzfY8P2jazfspFrZl5HjpFPLkVYTji7B+TJs48n8nNFNZ8GPUrKaGH57t/xxppXuW3' +
                'mD8jx+xGPBKSCOjYd2Mj81/+CUZQgGfhcPuVLDMydIAQahifriIS3sik8KsiU3Z+hLXsuu/OGSgMVcDXpTOIFJjHNgHSQ4UDtIZZveJqDx9YRyy1k' +
                'UK/zOGfQlZhBnLgZU0REtrC1qSxNcdcWrP8L67dv4NJpn6B/UX+V4bd8wxL27avivIkzKS/ug6vST5uZtfhHpDMZLrvgOprrHFYuX0OXLt2ZMv5iHA' +
                'PyKOQvC3/LplrZ+CnMBaNv5exOlxJKm4RDsmboBGagDKVnljzG4WMHGNp3FJeOmEHELsIUjjLkkAxSZEQ3lj7Cq4uepu5YPb26DyAWjdJ0rJ7Sks6' +
                'MOXsCMVM2tYhgifHpaiqTUQlAT45aPgG40mh2I75WSEuoiZV7f8/ylQu4cfr3KY0NxeUgS3a/xMZ1W+lT2pehw4bw+ppFNKdTXHXB9fSPDyQSSEHK' +
                'kIp9CrhZzZKGLj1e/UH4NZlgsoSGjFLZl8fWmjnauJ+dlW+xfs8GtcFhaX5nppx9BV3yh2IFeYRFOee3ZgMVThxfpi1LSL9mkm6GxSsXcrTuAPGiU' +
                'hpraynJK+D8MRdTEu+FEUTVzGH7zVQ37GPVxjc41nSUvHgxA/uPY1CXEYR1C1PynwyDZdteZdGG5xk5ehST+l2JkS4kHooRuDa6YeJpLvVaNXMWPEl' +
                'NdQ3XTrue7gW9CWlSEEym5BCOpJiYklnh0dzSyN5DG9lXtY94QRkDevajvKAL4SCCnfJUxr2ES2XmEnGBZX4E3DLpetwgTjqaYkvVsyxcPJdLJn+RLq' +
                'VDeXPtE2ysWsPgPsM5v/8VFIbLOJrYzUurHibR3MiU0Z9gSPl4ImZOFty2RH81Cau8V1VzHF/LKJdIvLuk08Ke6h1s3b2GI1V7SetNlPYsZliPqQwom' +
                'UTIySM3ZKF5mWxFGTeDYdkETrECF0ty+pKqAEki00htYhcHmqooinWlV/Eg4mYOYZnuPUdlQTiuqSI+jtlEbWovoWiUsN6ZmFaEnnIxfBs7nCSp2Rxu' +
                'PETnos5EtVyiQQ44lsqTUqoUw6HJr6chUa+m0S4FXRVVImXsRUTnpS11vxJSDBypxq3jhxtp1hoItHwMzyCmR9EyIigUy1l0OzaukVFtZ0lM+SSH7' +
                'omjQoGtYrZiMBxLHeLJOY9ihEOEoiGwHM4beSndCvsR1qLKFfC0DA1ONWt2rmDb/u3Ew53o020wXTp3IZYXy2aGi2DM8/Bclxa3iermShpbGjhWX0' +
                'VV1VF0T6cor5heFX0Z1PUsOud3J2LmoiMCAWksoRveVkS1Kway9oXSI2UlMdlXmQ/kt6w2Obvkt5/bZgCokZUtw5A9J6tHzmrqssnYWflA9rrZs9' +
                'rq4rdrqdqqUmVdub926NSv7Rqf460gtVN2uwy2zQU8/nNtMfTjv/VERtRfXf6E3LIU2NJ9bDej4sXHElUcPLqHguJ8iosKyKFc+ZYigFPeq+bh6hnE' +
                'LjzSfJD9h9dRXb2TdDqNJ3WXpCfruior64sxpRWgacWqxkRRSQGdikspKyqnU145YUOqlsYIayKTyR7Hqy9P5kH' +
                '/ET97QmtZhBjZukuyWAaqmLTMfjJ9So1C2UXDkHqFor6XLWRlUZUKLLpNJkgTBCmV2OxI0pZtq6ovkiEgVUclbBUxcoiG8jFNKUvgtGmW' +
                'NCw/jO7LOmO21SDOluo5GT/vHxHQkxq5jivqeCEWslOZvDiuTTgUJmNnMEJSzUyMo2xieiDmrsQhdQ/NlMlMSpZkJzTRAYsxZcha2V5K1hV' +
                '3SKQ42Ww/tTW4SvGUgidZ0XhgZQXkWRF5Wz2mf3TkPsTzn3jkKhWcHG3kQlsIsH3ZkuKTMhXrykDK1qRQq45Kt89WOM2uZ+93KP5KBQSy1J' +
                'WvFPi6qqzVtoCdpAvwIZ77H+IjJzaosLMt3F7Xqn0YtgEu25UJeFkDJPvzjkPWXgDz/cGVM0WkJqNf/ajqM+I2tdeNEuhPR4bzD4Hjez7kic' +
                'EVP/S9/Oc2q06AzSoj22zENl44O4kLXFLgK7t58HsdkgfjKXW+ACta6Ky9mq1ale1JYaW27zhOtgVOOC1nd0hqG7wyENuI63ZnIrsoZmdj5S' +
                'y0E9vqAzIafSWqfr8j+3mzPQLYxnJkAwueqiclpOLJF/s42Yb4v/j5DwHuO4+twrBvVwpt+3vbjNvunr3tprWhn6UZP6Dp2tdTMcYk' +
                'pUI+arRN52+X8e9YdE+l850Y3FO5asc5H4sW6AD3YwHDR3MTHeB+NO36sbhqB7gfCxg+mps4bXCPF4i332IHRfjRgHWyVz1tcOULJc' +
                'LTLrdsL6lwsjfS8fkz3wJnDNz2aE8HuGcepFO94mmD2zEtn2rTf/TnnTa4H/0tdnzDqbZAB7in2nJ/B+d1gPt3ANKp3mIHuKfacn8H5' +
                '3WA+3cA0qneYge4p9pyfwfndYD7dwDSqd7i/wcq7GlYPNw1sAAAAABJRU5ErkJggg==',
              width: 150
            },

            [
              {
                text: 'INVOICE',
                style: 'invoiceTitle',
                width: '*'
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Invoice #',
                        style: 'invoiceSubTitle',
                        width: '*'

                      },
                      {
                        text: this.order.id,
                        style: 'invoiceSubValue',
                        width: 100

                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: 'Date Issued',
                        style: 'invoiceSubTitle',
                        width: '*'
                      },
                      {
                        text: this.getCurrentDate() + '',
                        style: 'invoiceSubValue',
                        width: 100
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: 'Due Date',
                        style: 'invoiceSubTitle',
                        width: '*'
                      },
                      {
                        text: ' ',
                        style: 'invoiceSubValue',
                        width: 100
                      }
                    ]
                  },
                ]
              }
            ],
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: 'Billing From',
              style: 'invoiceBillingTitle',

            },
            {
              text: 'Billing To',
              style: 'invoiceBillingTitle',

            },
          ]
        },
        // Billing Details
        {
          columns: [
            {
              text: this.user.username + ' \n ' + this.user.company.name != null ? this.user.company.name : '',
              style: 'invoiceBillingDetails'
            },
            {
              text: this.order.customer.full_name + ' \n ' + this.order.customer.company_name,
              style: 'invoiceBillingDetails'
            },
          ]
        },
        // Billing Address Title
        {
          columns: [
            {
              text: 'Address',
              style: 'invoiceBillingAddressTitle'
            },
            {
              text: 'Address',
              style: 'invoiceBillingAddressTitle'
            },
          ]
        },
        // Billing Address
        {
          columns: [
            {
              text: this.user.email,
              style: 'invoiceBillingAddress'
            },
            {
              text: this.order.customer.address != null ? this.order.customer.address : '',
              style: 'invoiceBillingAddress'
            },
          ]
        },
        // Line breaks
        '\n\n',
        // Items
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: [30, '*', 'auto', 'auto', 'auto', 80, 70],
            body: rows
          }, // table
          layout: 'lightHorizontalLines'
        },
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', 80],

            body: [
              // Total
              [
                {
                  text: 'Subtotal',
                  style: 'itemsFooterSubTitle'
                },
                {
                  text: this.currency.set(totalSum).format(this.format()) + '',
                  style: 'itemsFooterSubValue'
                }
              ],
              [
                {
                  text: 'other',
                  style: 'itemsFooterSubTitle'
                },
                {
                  text: '',
                  style: 'itemsFooterSubValue'
                }
              ],
              [
                {
                  text: 'TOTAL',
                  style: 'itemsFooterTotalTitle'
                },
                {
                  text: this.currency.set(totalSum).format(this.format()) + '',
                  style: 'itemsFooterTotalValue'
                }
              ],
            ]
          }, // table
          layout: 'lightHorizontalLines'
        },
        // Signature
        {
          columns: [
            {
              text: '',
            },
            {
              stack: [
                {
                  text: '_________________________________',
                  style: 'signaturePlaceholder'
                },
                {
                  text: 'Your Name',
                  style: 'signatureName'

                },
                {
                  text: 'Your job title',
                  style: 'signatureJobTitle'

                }
              ],
              width: 180
            },
          ]
        },
        {
          text: 'NOTES',
          style: 'notesTitle'
        },
        {
          text: 'Some notes goes here \n Notes second line',
          style: 'notesText'
        }
      ],
      styles: {
        // Document Header
        documentHeaderLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left'
        },
        documentHeaderCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center'
        },
        documentHeaderRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right'
        },
        // Document Footer
        documentFooterLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left'
        },
        documentFooterCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center'
        },
        documentFooterRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right'
        },
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'right',
          margin: [0, 0, 0, 15]
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          alignment: 'right'
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: 'right'
        },
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails: {
          alignment: 'left'

        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true
        },
        invoiceBillingAddress: {

        },
        // Items Header
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: 'center',
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },

        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterSubTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterSubValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        itemsFooterTotalTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        signaturePlaceholder: {
          margin: [0, 70, 0, 0],
        },
        signatureName: {
          bold: true,
          alignment: 'center',
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: 'center',
        },
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10
        },
        center: {
          alignment: 'center',
        },
      },
      defaultStyle: {
        columnGap: 20,
      }
    };


    pdfMake.createPdf(docDefinitions).download('orders1.pdf');
  }




  async saveOriginal() {

    let columns: Bill[] = [];
    const rows = [];

    columns.push(new Bill('S.No', ['itemsHeader', 'center']));
    columns.push(new Bill('Product', ['itemsHeader', 'center']));
    columns.push(new Bill('Qty', ['itemsHeader', 'center']));
    columns.push(new Bill('Unit Price', ['itemsHeader', 'center']));
    columns.push(new Bill('Total', ['itemsHeader', 'center']));

    rows.push(columns);
    columns = [];


    let totalSum = 0;

    await this.order.productDetails.forEach((item, i) => {

      columns.push(new Bill((i + 1)  , ['itemsHeader', 'center']));
      columns.push(new Bill(item.product.name, ['itemsHeader', 'center']));
      columns.push(new Bill(item.amount , ['itemsHeader', 'center']));
      columns.push(new Bill(item.product.selling_price , ['itemsHeader', 'center']));

      columns.push(new Bill(this.currency.set(item.product.selling_price * item.amount)
      .format(this.format()), ['itemsHeader', 'center']));

      rows.push(columns);
      columns = [];

      totalSum = totalSum + (item.product.selling_price * item.amount);

    });


    const docDefinitions = {


      header: {
        columns: [
          { text: ' ', style: 'documentHeaderLeft' },
          { text: ' ', style: 'documentHeaderCenter' },
          { text: ' ', style: 'documentHeaderRight' }
        ]
      }
      //  ,
      //  footer: {
      //    columns: [
      //      { text: 'FOOTER LEFT', style: 'documentFooterLeft' },
      //      { text: 'FOOTER CENTER', style: 'documentFooterCenter' },
      //      { text: 'FOOTER RIGHT', style: 'documentFooterRight' }
      //    ]
      //  }
      ,
      content: [
        // Header
        {
          columns: [
            {
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAABlCAYAAAB3J3waAAAgAElEQVR4Xu29B3xc5ZX+/71tmqRRtyW594Y7tjEuYM' +
                'BgigGb0JJQQ0gCSZYku5tkk82ySfa3KUsS0ghphOKYHoMpBtvY2ODejXuXmySrjzTl1v/nvCOBQwDjwv7JRvfzkcfSzL1z7/u85ZznPOe8WhAEAad5yCXkR9' +
                'M09fPu44Pef6+vP/4aJ3pfvuvdn3n3PZzo/Xffr+/77/ss7/V98rcPuucAGw0fLQgDutwxgeYiDR9gytkYf9tsp4kKaKcLrjScNEb7A74b4OPfl8/ouv43' +
                'DfHuxpfPtB/tHeP4Jz3+ffm74zjquu++dvs58r7cl2EY79n53q8V27/73d/X/nnP89Szy3Xf6zPt7+uaj6GeKQukQIrmCcRvg6t/HMF9d09+v5Hb3iDv' +
                '9f5pd9HjLtA+g3wQYCe6hw87ct/vOu2d9e33ZXLM9v8stgrcQL28/cfjOvSZao/THrnt4H5cpuX/zc51/Izzgd8baApLNJ9A97KgBjqaIB34WaB160x' +
                'h+vZ1ThvcE62JH/X7H+XM8Tcj8F3N/+HBBcf2MUI2LhnAwNJi6IEOgYMa1kbk4wfuGb+j/4MX9AOwXQdPb6C64RC+Y9G9bBAmJrovYHtgxM74k5/2yD' +
                '3jd/R/8IKeGH1BkqR3hJcXP8/oEefTrfgsQoSwAgHXBT3njD95B7hnvEn/9oJiFydpZPPexbyx6jWum3EnBeF+RIMIITJoAq7WAe7/AhSn8BXK6hW3' +
                'xmuzhnUC+a/4/JpPWstwKLOduQsfwnc1Zk79HJ2jfQkFBob4v4h7KG7SmT06Ru6ZaE/l5ngEmtPmxlp4MtPqoGsOjXoDz7/1GFv3LCYWdOb2y75D' +
                'WagrRmATYOFjYX5c/dwz0T5/19f4K3A1Al9GoY4fOBiGy86mLcxa+gAuNZhuATdN/To9c/pjBZoiMYJACJgz3wIdI/dMtGkbuFnWSQ6TAJ2M10yg' +
                'tfLK+ufYkVhDQ/IghpvLNRPuYkjJOCLElL8rp39sGaoz0T5/19cQX0cZRbLu6vi+TmAIo9zMkYYdvLj8SVpyaqhrOYLmhLlyzC2c3WUqsaBIERmK' +
                '3+iYlj+uXUDGni8RDAJfw/XBNRxsvZGX35xNs3WUvQ3bcTUb3IAhZeOYOepOYm45pmYQ4KIbH0OG6uPa3P+799UGri/RMYNA10kGLTQ6h3jspZ9T' +
                'MTCP9XvXE4R0NN+hzOrKzZP/lUK/HyFNR7eEpYqe8VvuWHPPSJMKTeG3DV6DQNNpoZndtWuY++YjDBrTlTfWL4dICC1oJcfJYcbIuxlRNg1T+UytaH' +
                'rRGbmT4y/SAe4ZadJ2cDXwDVx80kYri7c+x5ZDS+h5VinLN67CNcTQSpDvRzgr72KuPffL6J6N7bYQiVa8fSfZ5ff0F+EOcM8EuNnlNhvt0QI8I0Myq' +
                'Gfem09RndhLt6FxFqx9mVBevgrVh9NQlC7ljqv/hVhQgW7k4RN6B9wADM3IRo3UGad2dIB7au32V2c5gat+F75J14RMbKXVr2Xum09RnzlE14ElvL5u' +
                'MUEshOf75AYRchN5fOrCO6nIH4kp1KOWXbezUGbDgdmx2wHuGYDo1C/RErQSaAFhhCs28YI0Ga2JuaueYl/jNs4a1p9X3ngVCg1SXpocLUpucyE3TPw' +
                'sfUvGEtYsdBXwbYvft83I2Rdxr2SSPnmQO0buqWP69pkJWlTjSyBAdwUEnxT1bKlZy6JNr3DuxGG8vGgOiXAzGdMmEuSS39qJO6Z9hU5WX8JBX' +
                'lswv+2Sgmr7D76CV8M46TvtAPekm+xvT0j5KXQMQoGFZou6IiCjJWjW6pmz9ClGjOjNms0L2d20Ey/qoWcijKqYzIwxnybs5WMQJfB1NN3A9wJ' +
                '0oat00CSWHwjr5aFr4gefnJHVAe4ZANfzfHRNR3N9Ak9UFT6e7uDqNnuO7qIlWU/GaGTppoUkvRS9yoZw4VlX0T3eF02BKjSGQ+CZGG0gCmMlfHM' +
                'gf/cF8A5wzwBUJ38Jz/YIxKgyXQLdIR0kCekhbM8lbMRI2C24VpodVRuxNIveJUPJ17qgewa+YZPRmrF0gyCwFMAhPaqiRDKAA5HhiGy4A9yTB+Z' +
                'MnOFlbHTLpzmoZVfdFo42HCFEmN7lA+iW25uGoIGFm1+gqmovA7oNZMrgK7C8Yqobj3KwdRsJu54uhf2pKOhB2IyDZxIxxDQTe0o6jtcB7pkA6m+u' +
                '8bb/2iZaVLJjEeCL3ZS1cF3dpcGrYuHGp1m/fxkONoYTJTcoYdq507FyPWa/9lui4YCIF2PG+bdSljeIt/Zu5a1DK0ik60nWanQt78KEsZPpHh+IQQ7h' +
                'IIQufLXnopnWyS65py9K/0ga9ON0UcFPQJT1Twgo+YcA28sQMU1816PeaGTOpllsPbAYPbeRlJ0kohVgpPIoiXVj2NCBLFkxD89NUxAvYtyYC2lu0Em' +
                '2eBQW5lNcmseufVs5VLmVumNVzLj4ZgZ2mkScCnQ7QDNAM8TCOrmG6TCoTtheEumx0cR0VYF1DUmwkJCe6ztqlC7c9QhLtr2MGYuQ8pqwojZeOkPUK6P' +
                'AHMyNl9zE5m2r2Ve5jwFDenHo2G627F6HFZFAoUvgxxjS71x69yrlrQ1rqd6X4Lppd9KzaCi5xHDTaaxItAPcE2J10h8I8IOkAlfzwuDreH6Abbm4Wpr' +
                'tVVt5dsX/4ERrsX0NKxzGc22sIEzQEuPyyTdRqBfRvbAbmpZLigSPvfIzauxN2GYTnhXB8IoJ2QWEwx4jhw+j4VAriUNw81V3YTpR8qxcDP3kNVYdI/c' +
                'EYAuB4AQZjMDECAzwNLA8WmlmT8sWnlvyFLX2AbRIAsxWFc81g1JoyeWcYRMoLcqjYddRpp9zIxkvTisOTy76OQczy8lE5LdcCGIYqRZMS8MINPp3H0qy' +
                '2qQ8NpCpY2eiuSHyw7GTnZU71twTDWSlsWhL7REjyvMzuHqCnQ3reHn1U9Q6B3GEVTZNDCONazvkWZ0YNXACBaF8Vq1YwqVnT2NYxYU4Ti5p02PJ9mdY' +
                'tvtx7GgLrZ6lksiiZiOe6+N7YPpRhvQeR/VulwvH3UDvToMpRMDVPjCb8t3P0jFyTzhyRdfok/Js0B0SXg0b9r7Juj2LqXcrCeX6pG0D3cvDIEa/7r3' +
                'oWVFKU80xtq7dxdB+E7lo+EzifjkuGl44oNbZwwsrf8v++k2k/AyxvAiZTINydzRDAPTx0hrdS4cT8Xpy9aSb6BSUZIkSTVNZjZZ1YuVGB7gnBFem5QQ' +
                'pv5UDzXtYtnMx2w+th0gKI+Siay6RSCGlRT0pK+hCY3Ut1fv3omUCRg2YwpjB08k3yrBcDS0EduDh6Rnq7YNs3PMmB6q3U1N/JCtND1wCM4Oj1RO' +
                'K+Oh+DqGgKxePuZFzSy5oY6p0JDXUNE+8BneA+yHAbUjtYsXWpazavZymUANuVEaxS0FOnBwjiqHHSSZbSDQcpDCWR99Owzi7/zQ6xwbiO1FilozG' +
                'JuU+WVYujh/G0ERW45MMamnM1HIs2UhNXRVHm3ZztHk9zZkDGKZBOhGhe94o7pz4b+RG87LZveKZKes9Szdno0Z/e3SA+yHAramvwtFsMl6SVJDC8' +
                'dPKDfIcF9f1KTJCRHJNgsIwup5DrqyQfi6mJ4Jzj0bH5L7fP09t0uHi8ydzxbguxB0XfIcW4ZZjIUS/0dzaQn5OLrYwXTXreWPDC1Ql9qEHYWaM/z' +
                'IDug5R63GIKHpgKsmkr0tYwVNJZe8GuAPcE1lUbSOlPdrqqxCch68F2TAdPkag42qQ1FwVZo8GGpaj4Rth6jI29/7sKV5bW09aD2MFLdz/9U9y2ch' +
                'SfLsJP1pAK2AFrRhBCM0zsSwDT0vT5FWzsXI5azeupCjSlaumXkueUYBmhwjpEUU+e7pYBD4mVge4HwLLv/mIL9Ge9jR4lUCtSF/FWMmR9EwyvkaOA' +
                'U5TivyQixa4eLF8ttUk+cI3H+FQYxxCYWJmC1OG5PDDr11DWGvGC8VoFVbEzpATysNLO0RCEXzNxzdc0iRpSTXz8mtzmDh6El0LexAL5aP5Qlt1gHs' +
                'qeP7VORLGy651gRq32QSvbEUL+V1C9StWbiXq53Hu0N5K9GbGHDJGiK1HUnz13sepas3H0zw05xhXTuzFvXdPJ2IkcXWDFtfCcDWWvbGOwlyL8ecMw3' +
                'dtbD+FFbJIeklanGYaa5vpU9EP39GIWDE1cmUG6ZiWTwfitgBB+yVUzQxdz45mTSMdJGhp1fj1z5+nML+MGz81iUiOiWX6eK7Orx5ZzJPzN+B6NuVFEf7' +
                'r67cyrHcBuB6BoVNdl+HXv36GbhUF3PzpywiZGSzTI/DTeL6Hbhg4Wpb6NANLxXxFHKDWXOlkga8EdR1+7qmA3Fatp90mlelYYvJqVtaFWmhGFF' +
                'SVR12+d9/jpHWfr9xzPb07xchxUnhWDgvW7KKhro5RZw2gd9didOkwgcbuvUe47/7f0KVnBV+++w7ycw1COEgFHDVbyJIgfLYp3yN+roEmNTaUVK' +
                'O9Zko2DbQD3FMAV+Kp7QtsIKNFNa4qdqBKFQWah+frkhTC7sMJvvHfD2KYOl///KeZOLgUO9WEEcsj8F0sM4zrabRkAjZvPcR9P32Q/HyLe//z83Q' +
                'qKcEKdAI3owykkC50J6jUXTHg1HJw/AO0l8OR1w5wTwFaCfNJ7m3WqRSpmu9nk7dkDXZdj6WbaslkMkweV0HINFm6/gjf+f4fKC6I8+17rmfsWeX4' +
                'XhNh08L1DRKOwaptR/mPH/6KcDiPn/73N+jbWWfdhj3s2LaTi86fTNeKXPACwmaAkxH/WAqiaFldlVoOskbdB8lfz4Ar1F5gSdag4w/R8nptqr3' +
                '3YVPaRNzZMfBOWaa/nmLaouViorY57tnvacvPUQ8ovTa75rzzXhaM7I8Qf9meLVl4KkSrzgtUZrv87Z2en303e6Xs37OJmdnnVKmZGQ8zrKvp8s' +
                'UXlvOtn75MXmGce24bxycuOxuPKLOf28FPfvkU3XsW8oN7b2Fotxh4SXwjh42VtXz5m78glUrxxS/eweTxA7FrUtz1lR+SchN0Lo7y4P98n5L8DL' +
                'qRxHFQ8WGlEFA69Tay+23y4r1lr6cNbuCk1XTh6yE84T2VmMvD0NJACtwcDFWpRRrRxfEyOJ6LFYqgSZRFyuRpSdVsDq4SbUt4yySs3jeFBnAS' +
                'eL6FacUx9Ui2KwQuyVQD0YiFpcu1wqrhPTEwJMNdgWFK4BVNru/rGL5GRg8rVyYdCAQugZPCUKPCUp9V4nCtrQiJ/E4YuQu5v9qGY9TVBvTq04nm' +
                '9DHyYsX89H9eZ86iSoKQxxVTyvjnuy8grENds8X371/C65s20atXDj/9+o10LYQddRrf/MnLVG45wM0XDObuu6eJqoY1byW45Rs/prB3MU71Hl777' +
                'S/oFE4TRHQa0iHqD++iV6+einZsr1p3omnotMFNi2GgSfqDjA0JPIvlZqrQl6j2fF3DFZ9NS+NpzaT8eupTVTSn6jlad4REaxLb8WluTpCxHbR' +
                'AV+dHojlEwzmE9DBFuUV0K+9CYTyfolAhUQmT2RF0L6LKOGm5AqaMSMnFkf+2jzwp7iXj0wFHQ9fSBEaeCtehxzH9NCHfagvEty9m7aNCZh6ZA8' +
                'WAyRo1XhCwaNEmtmzfzm13XoOvW1Tuq+PffzhbhQG/cc+1DO1fjjAaL766hu2VSZau2U9Nop6rLx3K3TdfxI9+9RJPL9jIwC6dGd83ztSp' +
                'o+g/pDem6/CrWa+xaNk2rrliPLdfMxrTD1i9/iDPzZ3Pl+64gvLyMjWQXNclFHon/eT9QD5tcJtVWjhEAh/Tz6DJ+uTp+FpEZbtljBYSwWFqGo+wv3o' +
                'Hh+v2U9V4kBY7gS+kux4nTy+hqKiIaCQH0wiRE83F9yTP1cO3TewWkaQcw043kBcO07W0B8MGjqcw1gNNiDdTxrKAICO1LQ1DLElFIfl4voPpmvh' +
                'mLb5fSHVqL5belfzcMGbKwhCZYZviXzWUSu1oPyRYn8EPTHQtRNoNeHTWy6xdv4t/+4+7yC0ySSTSuJ5LSVEcLwO//+1fqGk8zD1f+yzzXqniF7NeRY' +
                'sHTJ90Hi+/vAgjqvPVz1/BkO5Rvv2fP+X666/nyvMHE/geLYmAvAK5V5cX563gL0+/yff/8076VhRkB45h/O+N3KSf1deGggDdl+xyl4yfxDN1mtwW' +
                'ttUsYXvlCmqqj2FnpKEM8nKK6Nq1D51Lu9A1pxudwiXkRuOYgaRiyCiXqqnZtVGU9gYWjt9KY8sxGltreGvPW1RWHabfkAEM7juMnpYIynT0wEL3' +
                'LfDbRqFQc7pwPDZh3yJtHIR0Lo8vfZize19On969iEqoTumjZPRLJ2lPvmq3h101YqWACXoYT2vE9Uv5wQ/nsL+ykW997yYqimXtNiAwefA381i1e' +
                'jn33f91cnIjZFp0vvjdZ9l0tJWIGyHi2QzpF+YH//kJ9CDDxu1H+P4PHuazN8/k2suHgO2QckzmzF/Nw4++wHf//R7GjSjFEpFcW1Xc96uOe8Zd' +
                'Id+zVafXPDEwfIKwQwNH2V27mUWb5qmKadFwBMOPUVHYk0E9R9Kn/CzyrVI03ySiRTCFSpMx5vjohpQccPF1h5SfpKb+kFI4xGPlxEJF2L6Pq6X' +
                'Yc+wtFq2cqxicGefcTmm8SNWY0N0cAjuMIby6laYhVckbuzZSHi/AKrYpJM4fl/6ZCwZdTm5BIX2K+tHSkuRIzX50I0NJSSdc26S5OUleThj0F' +
                'JlMGNtpJZ5XRFOwmVhoNHrQl6/dM4toPOBn/+9GYrrO47PW8uzcOXzne3cy/KzuysTTvIDH52/nvkfXkWkNU2xk+ObnzuXyqT1wA5tWN8xT83bw' +
                'x6fm8t2v3crYocXs3lvD1/75Aa6//kpuvWE0Ec/HCv3/kE7itTahmwaO62DELKrtIyzZMo8N+17HDjUQ8iroWjCSYf1H0L98AHHyVbqUdAbN9tUIz' +
                '1jCt8iaGJD2W/C1JPsTu1i6bhE1zZX4QSMlkQFcOek2SiO9VfzDIkVN83ZeWPgX6tMeMy67nPKCCnLojO7G8MUWsBp468Aynl3zOqP79WNT1Q4u' +
                'GDSEOdvWMCSvC3tr6rh52nW89PJS+g7qzoZNSzn33Mns33OM1laPeL5FQ3MlmdYcijuFaWmxySk5RrKxB1dfeDfrNuh8+5v3c+st5zF0wED+370P' +
                'MPWSIXz5y5JUHeA7HpGQzc6jHp++ZzZOqJQCrYlnfno7JbmtZMTIDOXSYPvc+s0/0FRjcN+Pb+EnP3oAu6GV2X/6Jnq6GdOJE8o96WyS05fZBI6j' +
                'ONAglGFvYjsLVr9IVX0lHjbxvFwmDb2WwZ0nEZbClX5ATA+r3qwm3cDD0Vwc08QNMirwbQfNbDyyitc2vkide5RIzMTMxAgnC7nhgjvpVzQCy9Z' +
                'x0zZmbkAiXcODrz1AuqWO6y+9jvLYIHKMMrUuaWYN89c9TbWuc07vfjyxbDmD4x47zTwu7F3C8m0HGNqpnH0H00ycfA7PzP0jV105k9cWruOsAWPo' +
                '37MLzy96mOFDJlJVvQUj6ExRZ5eDuyNMnnAeZlDB/T9axeKV68kvjBOinl/95AsU5epEZK73XUwzQyId4fZ/nc3m+hRjBnbiD/82AyudIojEVBqJ' +
                'H7gsXFvHvffNJVTQmZrKtfz6u3dy0ehOBK6DnckhkiuW/Ins479+/7QNqowjAnmXXc3LmLvsYZrdakw/RN/OI7lk9CcoscrA1tD1CIYewfUCZcA' +
                'o9k2izpJorItl7YKRYv3ON1m06QWaQkdpDh0j1ypiUvl1DB84nM5WuXKR3EyAGQqT9KWoSJrVx15h1bKFxIMcrr3gTkry+is7IB3s4bnXHibeazD' +
                'FesDi7Y0MiFTT2GUsZZm3ONIaosJ0qW0uYOSowbww/1Gumj6TOc8uZcb0TxOOOcx++ufMvPJ6Frw2m8ljb2fLlrV0K53IgMERTLqxdY3P13+0gC' +
                'annls/2Z/PzJhCXNeQyruYtvJN7bTFfz/0Or9b/Aa3Xn8R37hqLDFb7k/DiKQJOSkct5Bbv/sAq/a5DOhSypM/vQFqGokV5allSSPvpIfuaYMr4' +
                'rEmbRe/eeX7tGhJmqp9po2dzqS+55OrdcIMwirRSVUdb2N5xGkS10IZptIIgUbasDmQ2sLsV35GUj9KyAoR2AVccvb1jOtyASFZRNv4DOFXFVO' +
                'kojI+jW41m7e/ypLNc+nSZzDTx91Fod0Zx9jD7+d9D41+uK0ZRo+/iLdWLmTYuReTrNnN6o3bqCjMo761kYquZVQe2ENZeRdqDie4+VN30Jp' +
                's5uln/synb7yZp558jJlXfoZ169bT2qwx/dIL0I1cWppMPvetJ9hz6BB//s0/MaA8TzzmLJelYr4amUDnkTkrePDROXzlS7dx1fn9CYvvrYkh' +
                'ZqLb4oZHmL1kG/feP4sv3XYjd14xhKhv4xkmacMjpslidHJD97TBTdPCa9seZvm+uTQmDSYNvY6Jvc+n1CrEcCJqdcxaFkJWtAe4s4BmQTaUr' +
                'uhwZjePvfYLWkJ78INWYl4Fl4z+LEM7TSAugekPOCRyUtuymT+89kMaQymuHPcFzs6bRF1yO7OW/owLx9xBzIpTml9CQ3M9RfECfM+nobGe3N' +
                'wcGpJ1FOYUUpdoID9SQNK2KS+uwPMCqmqq6VFexpGqQ1R06qbUEnbGp6ykCynbJRKK8vUfP8umrft59JdfpVOOZNc7yg1UPnuA0ke9tmIH9//kIb' +
                '77H19j4IASrFADJg5mkA9uCE+HVfsS3Pbl7/Dgfd9jQv84IS+Na1hkdIPYu2nlDzFDnza41d5+Hp3/A6qTu+nVdQyXjr6VzkaZcsAtTTS5gmxbNfA' +
                '2fvCd/heQIaDBq+W5N3/H3saVeFaCmF7MpWNvY3DRReh2jLzwB/dY8TEDrZHHVz3AuuqVDO06jhuG38bOPTtYsn0hn572T8RCefi+pww3OYx2KjOQY' +
                'mCinzBwPIeQGcLxPHRhyQxDhdwCL0HUssg48r502KwwXfI85P8PPLWKdZt28vPv3UJYLTNyPwKu6JBlVdLYfuAY3/3Oz7nvR/dSVKQTDjVh4GEE' +
                'eSrxK+3ZVNkw86Z/5bnZP6ciDGaQwtMMbN1CvvXkxu0Z2MBiefUrzF3+O7wgxSen3kPvnHHkSNk74VHNqCp/J8ZTNkz1DjGQLYTp0xQ08uKWZ3hr' +
                'z3xsasiNdOKScbcyMH8SEbeYiKEhwZH3O1TAPHDxPZfVR1/jqXW/JUc3+MKUr6FliqlJJRlSPkxVJVdRFUniatP/Kv5d1ntNriFpkvK2xGo1Bar4' +
                't4ahK+tc9FKGaSkiQdcNxRLJA5mmxfy1h1mzcTv33D4VS52frSQnHzCV66ZR3Wzz85/8gX/957vIicl1k23gxhSbZ/suzb7Ol77+Q371k29TIKwf' +
                'SXzNwJEIkeqAJ3ec9Mg9foMIsUif2/0QSzY/Q+/yXlw77p8o8nojci8fyUkNK7LfVIxetifL4cl41W31uvrgEp7f9AhBkCAnFGfSoGsZ0u0SCoMST' +
                'FfWLUmPlC1b3vsQHUJGmDE7xFF/Dw++/h0ydhU3nn07w8qn42qFhAUkTSShvgrFCS0qIAnYWSWhAC56BjHwfJV4JR3mbZ6eHFxHgMwS9J4nFd+EK' +
                'cq+vlWZYPuu/Vx+/lAsVRhbx9dNxe9LnSkJn7Q48OLchVxx+YVSjgpDd6SQIDrSYbJCtxZX46E/P8sdt1xLRAU1Usq2kPkmq5E6OXhPGlwBtH' +
                '2bFRFHP7fjt7y+6TkuHHcJk/vcSDxTjimyeSuDbYazE540mKpkKiPCIbBsWv16DtTu4qXVs6g39mHaUaaOuYHBZZeQ53UiJAnqRkaRCJpERN4' +
                'XXBcpWxB28zjq7uc3S79Nyq9kYsVUrhj6RTwKMbRsXcb2Q4ITypjLpq6LSjXLUknzKRYoa7m5og+W7WqE9Tr+aA82tW3JVJP0aGlN07VEkqZ9PA' +
                'muG1lwBWzH8/G0ELXH6inrXKgSyUw9C5t0euU56B5uYFF5pJoeXcuys51k1asAiCwaoY8e3ONHroijFx34M6+ufJqpk2YyvOISijxZb22w0riq+rf' +
                'cmICrrCpV/7BVa6TRO8LseX8k4VXj2C1MHfcJRnWbRm5Qju5kp0jNEhfAQyf/fcH1cEmJAZaJU6dVcv+ifyehHWJU/FxuHH8PmluMbjhZOUrbVbKYZ' +
                'Meq/F2pDmXfIWloqdtoe0SsLDjyWaVgaYufvu1stg0imQEyEjSRadTLZN08zcLWlBCGUOCoa/hKJuOp2UC90+4tCHwiulP2SICuGWRsFzNsKZVl9vl' +
                'lhMvs9RGP3HZw2zdUqmY9f/rLr+jfdzRTh99K2BX+yUYzJICXq3qboZQMUjZPU35pa1DLsysfZXftJtLNaSb0n8bFo2cS9uOEVSdI44n+SJMH' +
                'Es/2/RfdLLgJcjIxavx93L/4uySMeoblnsPN534By89B17N1FdvVijJyZQoW3ZE0bDqoxxVO3HZUdl48XKjCjYGjYRlSy1GdfVzjtrlxGkq37' +
                'GoBIemMfjo7Es2I2gPsHXAl3TNAkgRk5nMdCcK3bVgh671cxw/QRIFhyQxn4oktoFZuRzl9HzG47Snm7durZQ2U5qCSfdWbWLR0BdddeRcloT' +
                'Kh+dVa6QfyAIEaAQKur4u2t4k3977C0rfm0ao10a9oJDNGfZYCqxMRmYycJrRwCk8XQ6JQPegHlbwU1W5SuU4ah1u38sCS+2g1UowoHMcnz7lV' +
                'lQXCEwIguwuXdH5frh3IaHY4Ur+PpbtfovrYAfSMT5R8Rgwez8iBE5QZYyohWlT50zKKxMwJZJqW62gBdtBKS7IaSw+RHylWsQfdCOMp0bh0ih' +
                'Za7Aaq6o6Cm6FnlwGEgqJsWFTdj3Q0SDgJcizRL0vEUJaBXEWAKPGOGvES4jvDI1f2NFIyTlm3pKphINOEhRaEVAaVwJwAABaySURBVB1/ZYMY' +
                'Dkeqd6pJpGv5wGwMVNUfblTrl+fE0P0YKSPJrvRynl71W1LJFCV6f64dfwd9CwdmJSRvKzPapqm2EftBjySnZBRB0sjaAy8zb+0zeAYM6T6e6S' +
                'NuIO6XgicWTFpx1jIV27rOoWQlb2x5gb3H1tFo5hDKtNDZCIjrpbiZCiZPuIHuBV0plHg0cTQthak1oPlRXLuAtK6RtOpYtvvPbNn+Ir3KJjF5' +
                '9F0UajlEnKRy4TJRjZX1L7F05wvUNxwmknKZfvYXGNFlOoa4ZeEGUthksNhav4rKyi2kmpsY1ms8A7tPJOIXZ6XmvodmfAT0o7gGWQH2u0au8uPE' +
                'cpQRYKu1RjZh0JRHJvOYdIZUVpqpR9W+OvXuIZ5e9Uf2Nm4jHORy6cjrOaf7RUSkl57qISSBF+CYNby04SE27l+JE2icP+Iqzut5BVEnP1vfCeGx0z' +
                'h6I9uOrub1da+oQiMypRbk9eKcwWPpWVKhCpdsr9nJ0mWridOZa6Z8ki75fcULVgCrTk2U1sBly7E3eeGN3yjZy6g+l3DJsBsJuZIJkCbhH2PlrqWs37G' +
                'MOr8SPRYQd8qYPvZaBnUahUkBtu9Qm9rFgvXPsrt+J4GbQrcNSqJ9+fQVX6bALCdwxKiTWUdmizM6cmXWzyhfVTZakNHl+D6m4WP7CWVmVjXsJjdWSF64A' +
                't+1VBUWXaYbFScX2YvYfClsrYr5W/7C2r2ryLg6w3uM5+rR1xFycolY8VOFVp1nuzZN+j5mLf0FhxP7CZwoN075PIPj44jYOaCy4KWrpVmx+yVWbp2D6zep' +
                'Bh7WbwpTBl5ImE5kNKjT9/GXlT/jSN1OQukufPLCbzGwsC+G2AKBia9pJP0mmjnK7FceoDazj/zIWdw45S7KtU6ELZMqu5IF219iV+UGxgwczI7KdRxN1DK' +
                'o82SuOueTRCUJzA/YXrmNZZtfJ7+bz87qleiugZHOY8YFn6FP8RhCXg6mWGqeg2ZmBXInc5zAFRJwRd8kjp94XpByxJKTWhANbN2/hkVrn6GkuBczJ32RUJB' +
                'PzBATKqU6BF4UVxc1RgMbq15g3qrHcXSTosgArp1wO11DXTE16eknTkd8/4fKplhua1jG48t+h23aFOhduf3Cr5LvdSEipQ4iLbQECVbsfJNlm+fhW' +
                'Y3kx/KZNHQ6QzpPIjcl6v1cWsIO87c9wYr9j+F6AsZ5zBj7LxRJ4pUXwSWMYwSktSMs2PgYm3YvV2mZU4Z+lrE9LsXyPRpTO3lp' +
                '1XMcsx0mjJ9Ea/MOlqx6inC0lKkjPsfgsnPQ/BbWbVvE5v0bOOf881izawn7jr6B5RQydtA0zut/NWGK0Vwja9B5GXTrjK+54mXJVCROY' +
                'BZcEaDVth7EDCV55Plf0WTtxUvncNuV/0FFZKByvjVhVlSZu1y' +
                'SgcfB1k28sPLXHEvuIax3Yvo5dzK0ZCIRJ5x1D8InTiQ+Hlyx1MUNE4NON3zS/jGeXPV7NtQsU0vDlCEzmNjzSuJaMY5jY5tHWLdvCUs2' +
                'zsPWHXLD5Vwx+VP0iA0gShw9rZM2Muxu3coTix/AtxrI16PccOHnKAsNISz8t23gh3JI62m2VL/C/Dcfwtdd4jmd+cyU76E5OSTNI8xbOptUyu' +
                'eaaZ8nSYY/L/gxKXc3/TuN5/IxX4F0mlWrniewIgwZOZEtda+zfOMTeGmDPp1HM3PCZ8HOI1cvVha454CqkK+JjFZCiKZ6PQPJ1wKuiNbE2JF0xABX' +
                'yyih258XPsjB2p1k4jW4qTDTx3yOsd0uRM/oWIbsTeeSCaQ4bTNPvP579tVtIhI1GdvnPKYMvI4cr5MK2MtaqJ+kyuD4DRJl48O9iTU8suDXZGLNmJk8b' +
                'rngHvrmDlfkgW9k2HRkPguWPYWjN1GQ34NpEz9Ll/BwIkFYyYMyXpo6Kpm97Jccqd9L1CngkhEzmdz/QlXLUX1fOEYzGardfcx68Sd4Ri2WH2HcsIuZ3' +
                'ONakkEVsxb/BMss4RMTv0xMC7HhyOvMWf80uh7m2nOuo2teFxYvfoH8aGfGjLla1cf442tfI+XsokvoHK6ecjudw/1ViqZaR4QSNSWT3seyxKYR1ysL8I' +
                'm2iVWe/Ik2R1aca7bjKNdB4KpK7eORF39PRm8m3ktkl40ML5/IjLNvRc/kY5k6rV4DQaiJV996llW7loEeokdxf26ccCtxrxTNjhJEhDr3sU5yU532/W3l1' +
                'dPTPLHul2w8spK0m+D8QVcwvf9NGJl8nEiGrc2rmffmH0m1NlOUV8Yl0sgFw7C8QkIStdE9mqlj/s4nWbn7BUWX9s0Zw6cmfwkznUM4LOpIQ+1ZkNBreH' +
                'bln9hbs04cU7rlD2bG5FsUeM8v+B3hWMBlE+7G8irQzUM8sezHbD52mCG9pnLRoHHMn/8Q/StGM2HETch2UfM2PsSWo68S2CZXjbiDod0nYni5yNgQnkD' +
                'KNARaCDcwsd613J4ZcNtyYsSRFrGZHTSwaMM8lmxaxKjzRuLnOGxYvZZu4Z58esrdhNJdleresRKs3fsCC7Y+TrOWoihvkHJ7ups9Cacjwi1ih1AEW85' +
                '7JDF9kOHQvpu2KAH3H9vF75f9F61mLbmxXG4afxd9jHEELRb10aM8vup3HGxYSUG4B1OGX8eQsjFImD0702VFA1vrlvPMiodo0qrIC+dz3bmfZWDOBD' +
                'w7jBYykHIYQaiFBdtm8eaeFwmsDEYmj6sn3U636BCeWf0gKbuWWyZ/lVy3L1rEYVP9HJ5b9TvMWAFjBl/E3g176F8xjImDr8bUYtRmNvHUkl9wpL' +
                'mOIT3P44ZRN2MF+ZheBM1NQkQSvJN4Rg6VlbXkRfLoVNrp7ZoYpy1tlTXWFb/WFbZFgs4JmowafvfCzwnpJjdfdjs7MjuYu/BhiowYn5n6LYrcwX' +
                'iezn5vFbNX3k8qnSQvqGD6lE/RI28weX4euq2pwh6eKS5WlvZrP1SEpq1qeJaRk96bwfTjkBGNo08QsWnxm7ENjSfmPcpBfz6kS5kyfAYT+0zGsqOK' +
                '9Vm8fw4Lt/4Z09e5bOxtDCu7BDMdxtJ89FiKVJCh0U7w5Iofc7hpm+LBzx14GRf2uwnLKVGWrxQRExZs68FVLNryJF5uA7W1x+jXdRgTR1/G0tdX0' +
                'Jyp5erzrqe3ORq3VSedX8vDq3/Avvp15OoxcoxS+pedzwWyHClqsoFFe+awdMNcivJ68Ynz7qZHqAumVKzJaARS9ZUWglDAjqq9rFixlqsmXkNJcYl' +
                'qpjMiSleOUGAT8Sy1BqTNBGubl/PUq49wyehpXNL3avYH+/jt89/C1DN8asp36GaOxQkOMnv5/7Dd3kPc6c3Voz9Nn/L+yp+NEM1Gh5TfLGE/WVuEqM' +
                'tyv2pnaMUHvU3zK5/ZCMKQ1hX3mtRbcKxmFu54mZVb54N+mIHFVzNz3N1ERdlgORxO7eWZFQ9SldzC6PIruWjEleQEpYScHDRTV4SKqDSXvvUKKyqfx' +
                'tRcOlvduWbCFygLjyBCjtquzTcaqWut4skFj9N9ZBnbK9fSVF/NhRMupLKynoNH6rl8/PUMLx6L0RrGMdNsS63lz6t/gxPUEk2aDOo2lvOH3U6F3g' +
                'M9SFCnH+SPC35Ps13F5IGXMqnfDCJSq1lRChKw8AksjyOJQ7yybB7jx0xgUMFITFGjnDlwIem7xETJn7HJROqZ9eYf2XN0D3df8890tnuSCCd5e' +
                'MF3aEgeYMLI2xjVdQILl/2IffXLaaUnF4+8jaEVwxU4OaoiqZDssoAEBBKOaYOxfWesLKXfHtwSY8Yk8AICw85mm2OQCTzWHljA65sfI6MdpXNkE' +
                'NPP/QwV4bMIB1E8vYXle19m7trZxEvyuHXcf1GWW4Tvp1V9Cce3cE2HtXtf5o3Nc2gNNaKlI0zodwkXnzUTS2aJwMM3Wjma2MfzLz5Jn5GDyOTrzF' +
                '/1PF3LwpTFC9j/VoKJZ1/P8J7jKKRAgdNq1DPnrVmsPLBIJaH0Dvfm8nE30iV3GHprGCscsD+1gT/N+yW5eXFuuvAuSs0++BI1UzlADmk/QUu6iQVL' +
                'XmbIsEH06NybIrPnO+S4tNGHIDQ+0KBSfq0fEFYirwStof08OOd+yrv1Z+bY28lLFhNENZYfmM3clQ/Tve9EcsM57N/7LKEgxaTh/8LIHtOFjcXSIr' +
                'h2QEiIcRXikpGapTQl1UrR7GoEZ1NA2itpitZKShk7oQBHT5Kgjm1HN7B09RxavUqK4vlcMepL9CrsRYQSfDHUrCaeXvYLNh1Zy9Bh53Ft7y+qAiGa5' +
                'ZLWWrGDJLuPbGHF+gWUds1hQ+Vq4kY3bpz4JXrm9QMnQxBuosGu4eU3XqUgGmbkuHP50+tPUOMeIj/HJnGgjgsGX8v5Q29VM5JwYLbWRJW7m4ff+A1H' +
                'Ww9TLG7fsOsYXXE+hhdGcwNcS2PtoVeZt2YW/bqN4pqzbyOsxfF0i6SbVK5dU7qa15a+wqB+Azir50C18aO4kKrTfwhQ2+e8E4IriV3SwBm3iTp/DQ' +
                '89+0vOPWcmk/pcR8wNk7Y9vOghfvXqvRxKHiMUDWPYCaYNu4xJPW5Bc+Posr76GoYU0GrPxFMhuHdCWgpc6b0qqN+WrdcWLxXCP21CI8eoTK3hpdcf' +
                'xnGShLQSrp5yG4NyximCXrOF884nY9bwx5fupS5o5KIJn+ScvImYeiEZIfqNJg41bubVJc8yfuRkFZ77y6pfMqD7WK45+8uK0TLNFOngCG9sXc7eql' +
                'punDqDg80HmLX0Eer8aiKEGVQwnE+O/wJxrStkdCn7RtKqYnPjmzzxxsOKKhxeMZHrR96B2ZpHOCIDL0ULOiv3v8xrqx/j0vNuZlTnyRiSYG3l4JDmS' +
                'PNh5i+ex/izx3NWl6HorqkiVZjZnKbjjckTsVUfwhUCxwPHTLD+wGxeWzaXq6fdQ8/4ZHIwSXkJjFCSuZv+wJpDiyES4/yRNzCicAqd7RJ0mYZDEu5' +
                'rYyTbAt3ZgJYEqyWcJeaaVAoXrloICg3JcxK5ikzELjZNwVE2HV7KC4sfIxQz6FzQl6sm30XEr6DcKhCtg8obggitHOXRl35Eq5Fh/JjpjCsepVJZjH' +
                'CUbUe28sbqRUyaMIHuJf3YsXcXT6/9Pmf1H8vFw29WdZJjmsazC2bjWDoTL5hGd60HCzY8wbKjz9HoNVJiDeK6CV+ij5AgwgFkTPyQRrN5kLmbZrF29' +
                'wri0SKun3AH/WJnYzkhtEiGJM2kNYPNR99g4dJZjB95Kef1u0xMVWzfY8P2jazfspFrZl5HjpFPLkVYTji7B+TJs48n8nNFNZ8GPUrKaGH57t/xxppXuW3' +
                'mD8jx+xGPBKSCOjYd2Mj81/+CUZQgGfhcPuVLDMydIAQahifriIS3sik8KsiU3Z+hLXsuu/OGSgMVcDXpTOIFJjHNgHSQ4UDtIZZveJqDx9YRyy1k' +
                'UK/zOGfQlZhBnLgZU0REtrC1qSxNcdcWrP8L67dv4NJpn6B/UX+V4bd8wxL27avivIkzKS/ug6vST5uZtfhHpDMZLrvgOprrHFYuX0OXLt2ZMv5iHA' +
                'PyKOQvC3/LplrZ+CnMBaNv5exOlxJKm4RDsmboBGagDKVnljzG4WMHGNp3FJeOmEHELsIUjjLkkAxSZEQ3lj7Cq4uepu5YPb26DyAWjdJ0rJ7Sks6' +
                'MOXsCMVM2tYhgifHpaiqTUQlAT45aPgG40mh2I75WSEuoiZV7f8/ylQu4cfr3KY0NxeUgS3a/xMZ1W+lT2pehw4bw+ppFNKdTXHXB9fSPDyQSSEHK' +
                'kIp9CrhZzZKGLj1e/UH4NZlgsoSGjFLZl8fWmjnauJ+dlW+xfs8GtcFhaX5nppx9BV3yh2IFeYRFOee3ZgMVThxfpi1LSL9mkm6GxSsXcrTuAPGiU' +
                'hpraynJK+D8MRdTEu+FEUTVzGH7zVQ37GPVxjc41nSUvHgxA/uPY1CXEYR1C1PynwyDZdteZdGG5xk5ehST+l2JkS4kHooRuDa6YeJpLvVaNXMWPEl' +
                'NdQ3XTrue7gW9CWlSEEym5BCOpJiYklnh0dzSyN5DG9lXtY94QRkDevajvKAL4SCCnfJUxr2ES2XmEnGBZX4E3DLpetwgTjqaYkvVsyxcPJdLJn+RLq' +
                'VDeXPtE2ysWsPgPsM5v/8VFIbLOJrYzUurHibR3MiU0Z9gSPl4ImZOFty2RH81Cau8V1VzHF/LKJdIvLuk08Ke6h1s3b2GI1V7SetNlPYsZliPqQwom' +
                'UTIySM3ZKF5mWxFGTeDYdkETrECF0ty+pKqAEki00htYhcHmqooinWlV/Eg4mYOYZnuPUdlQTiuqSI+jtlEbWovoWiUsN6ZmFaEnnIxfBs7nCSp2Rxu' +
                'PETnos5EtVyiQQ44lsqTUqoUw6HJr6chUa+m0S4FXRVVImXsRUTnpS11vxJSDBypxq3jhxtp1hoItHwMzyCmR9EyIigUy1l0OzaukVFtZ0lM+SSH7' +
                'omjQoGtYrZiMBxLHeLJOY9ihEOEoiGwHM4beSndCvsR1qLKFfC0DA1ONWt2rmDb/u3Ew53o020wXTp3IZYXy2aGi2DM8/Bclxa3iermShpbGjhWX0' +
                'VV1VF0T6cor5heFX0Z1PUsOud3J2LmoiMCAWksoRveVkS1Kway9oXSI2UlMdlXmQ/kt6w2Obvkt5/bZgCokZUtw5A9J6tHzmrqssnYWflA9rrZs9' +
                'rq4rdrqdqqUmVdub926NSv7Rqf460gtVN2uwy2zQU8/nNtMfTjv/VERtRfXf6E3LIU2NJ9bDej4sXHElUcPLqHguJ8iosKyKFc+ZYigFPeq+bh6hnE' +
                'LjzSfJD9h9dRXb2TdDqNJ3WXpCfruior64sxpRWgacWqxkRRSQGdikspKyqnU145YUOqlsYIayKTyR7Hqy9P5kH' +
                '/ET97QmtZhBjZukuyWAaqmLTMfjJ9So1C2UXDkHqFor6XLWRlUZUKLLpNJkgTBCmV2OxI0pZtq6ovkiEgVUclbBUxcoiG8jFNKUvgtGmW' +
                'NCw/jO7LOmO21SDOluo5GT/vHxHQkxq5jivqeCEWslOZvDiuTTgUJmNnMEJSzUyMo2xieiDmrsQhdQ/NlMlMSpZkJzTRAYsxZcha2V5K1hV' +
                '3SKQ42Ww/tTW4SvGUgidZ0XhgZQXkWRF5Wz2mf3TkPsTzn3jkKhWcHG3kQlsIsH3ZkuKTMhXrykDK1qRQq45Kt89WOM2uZ+93KP5KBQSy1J' +
                'WvFPi6qqzVtoCdpAvwIZ77H+IjJzaosLMt3F7Xqn0YtgEu25UJeFkDJPvzjkPWXgDz/cGVM0WkJqNf/ajqM+I2tdeNEuhPR4bzD4Hjez7kic' +
                'EVP/S9/Oc2q06AzSoj22zENl44O4kLXFLgK7t58HsdkgfjKXW+ACta6Ky9mq1ale1JYaW27zhOtgVOOC1nd0hqG7wyENuI63ZnIrsoZmdj5S' +
                'y0E9vqAzIafSWqfr8j+3mzPQLYxnJkAwueqiclpOLJF/s42Yb4v/j5DwHuO4+twrBvVwpt+3vbjNvunr3tprWhn6UZP6Dp2tdTMcYk' +
                'pUI+arRN52+X8e9YdE+l850Y3FO5asc5H4sW6AD3YwHDR3MTHeB+NO36sbhqB7gfCxg+mps4bXCPF4i332IHRfjRgHWyVz1tcOULJc' +
                'LTLrdsL6lwsjfS8fkz3wJnDNz2aE8HuGcepFO94mmD2zEtn2rTf/TnnTa4H/0tdnzDqbZAB7in2nJ/B+d1gPt3ANKp3mIHuKfacn8H5' +
                '3WA+3cA0qneYge4p9pyfwfndYD7dwDSqd7i/wcq7GlYPNw1sAAAAABJRU5ErkJggg==',
              width: 130
            },

            [
              {
                text: 'INVOICE',
                style: 'invoiceTitle',
                width: '*'
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Invoice #',
                        style: 'invoiceSubTitle',
                        width: '*'

                      },
                      {
                        text: this.order.id,
                        style: 'invoiceSubValue',
                        width: 100

                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: 'Date Issued',
                        style: 'invoiceSubTitle',
                        width: '*'
                      },
                      {
                        text: this.getCurrentDate() + '',
                        style: 'invoiceSubValue',
                        width: 100
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: 'Due Date',
                        style: 'invoiceSubTitle',
                        width: '*'
                      },
                      {
                        text: ' ',
                        style: 'invoiceSubValue',
                        width: 100
                      }
                    ]
                  },
                ]
              }
            ],
          ],
        },
        {
          text: '----------------------------------------------------------------------------------------' +
            '---------------------------------------------------------------------------------------' + ' 85126',
          style: 'notesText'
        }
        ,
        // Billing Headers
        {
          columns: [
            {
              text: 'Billing From',
              style: 'invoiceBillingTitle',

            },
            {
              text: 'Billing To',
              style: 'invoiceBillingTitle',

            },
          ]
        },
        // Billing Details
        // Billing Details
        {
          columns: [
            {
              text: this.user.username + ' \n ' + this.user.company.name != null ? this.user.company.name : '',
              style: 'invoiceBillingDetails'
            },
            {
              text: this.order.customer.full_name + ' \n ' + this.order.customer.company_name,
              style: 'invoiceBillingDetails'
            },
          ]
        },
        // Billing Address Title
        {
          columns: [
            {
              text: 'Address',
              style: 'invoiceBillingAddressTitle'
            },
            {
              text: 'Address',
              style: 'invoiceBillingAddressTitle'
            },
          ]
        },
        // Billing Address
        {
          columns: [
            {
              text: this.user.email,
              style: 'invoiceBillingAddress'
            },
            {
              text: this.order.customer.address != null ? this.order.customer.address : '',
              style: 'invoiceBillingAddress'
            },
          ]
        },
        // Line breaks
        '\n\n',
        // Items
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: [30, '*', 'auto', 80, 70],
            body: rows
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', 80],

            body: [
              // Total
              [
                {
                  text: 'Subtotal',
                  style: 'itemsFooterSubTitle'
                },
                {
                  text: this.currency.set(totalSum).format(this.format()) + '',
                  style: 'itemsFooterSubValue'
                }
              ],
              [
                {
                  text: 'other',
                  style: 'itemsFooterSubTitle'
                },
                {
                  text: '',
                  style: 'itemsFooterSubValue'
                }
              ],
              [
                {
                  text: 'TOTAL',
                  style: 'itemsFooterTotalTitle'
                },
                {
                  text: this.currency.set(totalSum).format(this.format()) + '',
                  style: 'itemsFooterTotalValue'
                }
              ],
            ]
          }, // table
          layout: 'lightHorizontalLines'
        },
        // Signature
        {
          columns: [
            {
              text: '',
            },
            {
              stack: [
                {
                  text: '_________________________________',
                  style: 'signaturePlaceholder'
                },
                {
                  text: 'Your Name',
                  style: 'signatureName'

                },
                {
                  text: 'Your job title',
                  style: 'signatureJobTitle'

                }
              ],
              width: 180
            },
          ]
        },
        {
          text: 'NOTES',
          style: 'notesTitle'
        },
        {
          text: 'Some notes goes here \n Notes second line',
          style: 'notesText'
        }
      ],
      styles: {
        // Document Header
        documentHeaderLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left'
        },
        documentHeaderCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center'
        },
        documentHeaderRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right'
        },
        // Document Footer
        documentFooterLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left'
        },
        documentFooterCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center'
        },
        documentFooterRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right'
        },
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'right',
          margin: [0, 0, 0, 15]
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          alignment: 'right'
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: 'right'
        },
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 25, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails: {
          alignment: 'left'

        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true
        },
        invoiceBillingAddress: {

        },
        // Items Header
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: 'center',
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },

        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterSubTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterSubValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        itemsFooterTotalTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        signaturePlaceholder: {
          margin: [0, 70, 0, 0],
        },
        signatureName: {
          bold: true,
          alignment: 'center',
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: 'center',
        },
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10
        },
        center: {
          alignment: 'center',
        },
      },
      defaultStyle: {
        columnGap: 20,
      }
    };


    pdfMake.createPdf(docDefinitions).download('orders.pdf');

  }


}
