import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { User, AuthenticationResponse } from '../classes/user';
import { UtilsService } from '../../shared/services/utils.service';
import { Config } from '../../shared/classes/app';
import { isUndefined } from 'lodash';
import { ErrorMessage } from '../classes/errorMessage';

// ng serve --proxy-config proxy.conf.json
@Injectable()
export class AuthService {
  private _authUrl = `${new Config().api}/auth`;
  private _unauthUrl = `${new Config().unauth_api}`;
  private _detailSub: Subscription = undefined;
  private errorHandler:ErrorMessage;
  

  constructor(
    private _utils: UtilsService,
    private _http: Http,
    private _router: Router,
    public translate: TranslateService
  ) { }

  login(credentials: any): Observable<any> {
    this.loading('show');
    return this._http.post(
      `${this._authUrl}`,
      JSON.stringify(credentials) ,
      this._utils.makeOptions()
    )
      .map((res: Response) => res.json())
      .do(
        (data) => { this.afterLogin(data); },
        error => {
          this.failedLogin(error);
        }
      );
  }

  register(credentials: any): Observable<any> {
    this.loading('show');

    return this._http.post(
      `${this._unauthUrl}/register`,
      credentials)
      .map((res: Response) => res.json())
      .do(
        (data) => { this.afterLogin(data); },
        error => this.failedLogin(error)
      );
  }

  getUser():Observable<User>
  {
    const headers = this._utils.makeHeaders({ withToken: true });
    return this._http.get(`${this._authUrl}/detail`, this._utils.makeOptions(headers))
    .map((res: Response) => res.json()).do(
      (data) => {
        localStorage.setItem('currentUser', JSON.stringify(data));
     }
     ,
     (error)=>{
        this._utils.unsetCurrentUser();
      });
  }

  detail(): Observable<User> {
    const headers = this._utils.makeHeaders({ withToken: true });
    const user = this.getCurrentLoggedInUser();
    if (!user) {
      return this._http.get(`${this._authUrl}/detail`, this._utils.makeOptions(headers))
        .map((res: Response) => res.json()).do(
          (data) => {
            console.log('SUCCESS GET USER FROM SERVER:' + JSON.stringify(data));
            localStorage.setItem('currentUser', JSON.stringify(data));
         }
         ,
         (error)=>{
            this._utils.unsetCurrentUser();
          });
    } else {
      // if(JSON.stringify(user).hasOwnProperty('username')){
      //   console.log('SUCCESS GET USER FROM CACH:' + JSON.stringify(user));
      // }else{
      //   console.log('CLEAR CASH.....');
      //   this._utils.unsetCurrentUser();
      // }
     
      return Observable.of(user);
    }
  }

  getCurrentLoggedInUser(): User {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  isAuthenticated(): boolean {
    var token  = localStorage.getItem('oatoken');

    if (!token) {
      return false;
    }

    if (!isUndefined(this._detailSub)) {
      this._detailSub.unsubscribe();
    }

    this._detailSub = this.detail().subscribe(
      data => 
      {
        var user=<User>data;
        
      },
      error => this.logout()
    );


    if (!token) {
      return false;
    }

    return true;
  }



  afterLogin(data: any): void {
    console.log('@@@@@@@:'+JSON.stringify(data));
    var authResponse:AuthenticationResponse=data;

    this._utils.setToken(authResponse.token);

    console.log('##Token:' + authResponse.token);
    this._utils.notyf(
      'success',
      this.translate.instant('notification.login.success')
    );

    if(this.isAuthenticated())
    setTimeout(() => {
      this.loading('hide');
      this._router.navigate(['/dashboard']);
    }, 2000);
  }

  failedLogin(error: any): void {
    // this._utils.notyf('failed',
    //   this.translate.instant('notification.login.failed')
    // );

    // var msg=new ErrorMessage();
    var msg:ErrorMessage=JSON.parse(error._body);
    console.log("Error:#:"+JSON.stringify(msg));
    this._utils.notyf('failed',msg.message);
    
    this.loading('hide');
  }

  logout(): void {
    this._utils.unsetToken();
    this.unsetLoggedInUser();
    this._router.navigate(['/login']);
  }


  unsetLoggedInUser(): void {
    localStorage.removeItem('currentUser');
  }

  loading(act: string): void {
    this._utils.loading({
      selector: 'storaji-login .uk-card',
      action: act
    });
  }
}
