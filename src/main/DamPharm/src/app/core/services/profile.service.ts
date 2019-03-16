import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { NgProgress } from 'ngx-progressbar';
import { UtilsService } from '../../shared/services/utils.service';
import { Config } from '../../shared/classes/app';
import { User, AuthenticationResponse } from '../classes/user';
import { ErrorMessage } from '../classes/errorMessage';
import { AuthService } from './auth.service';


@Injectable()
export class ProfileService {
  private _profileUrl = `${new Config().api}/auth/changepassword`;
  private _headers = this._utils.makeHeaders({ withToken: true });

  constructor(
    private _utils: UtilsService,
    private _http: Http,
    private _auth:AuthService,
    private _router: Router,
    private _progress: NgProgress
  ) { }

  update(profile: User): Observable<User> {
    this.beforeRequest();
    const body = JSON.stringify(profile);

    return this._http.put(`${this._profileUrl}`, body, this._utils.makeOptions(this._headers))
      .map((res: Response) => res.json())
      .do(
      (data) => {
        console.log(data);
        this.afterRequest();
        var authResponse:AuthenticationResponse=data;
        this._utils.setToken(authResponse.token);
       
      },
      error => { this.handleError(error); }
      );
  }

  beforeRequest(): void {
    this._progress.start();
    this._utils.notyf('success',"Password changed");
  }


  handleError(error: any): void {
    // this._utils.notyf('failed',
    //   this.translate.instant('notification.login.failed')
    // );

    // var msg=new ErrorMessage();
    var msg:ErrorMessage=JSON.parse(error._body);
    console.log("Error:#:"+JSON.stringify(msg));
    this._utils.notyf('failed',msg.message);
    this._progress.done();
  }

  afterRequest(): void {
    this._progress.done();
  }

}
