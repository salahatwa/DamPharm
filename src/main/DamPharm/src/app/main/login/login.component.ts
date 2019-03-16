import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Config } from '../../shared/classes/app';
import { AuthService } from '../../core/services/auth.service';
import { UtilsService } from '../../shared/services/utils.service';

class AuthenticationRequest {
  username: string;
  password: string;
}

@Component({
  selector: 'app-dam-pharm-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials = new AuthenticationRequest();

  private _sub: Subscription = undefined;

  constructor(
    private _title: Title,
    private _auth: AuthService,
    private _utils: UtilsService,
    public app: Config,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this._title.setTitle(this.app.name);
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  onSubmit() {
    this._utils.unsubscribeSub(this._sub);
    this._sub = this._auth.login(this.credentials).subscribe();
  }

  onChangeLanguage(language: string) {
    this._utils.setLang(language);
  }

}
