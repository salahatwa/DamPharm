import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Config } from '../../shared/classes/app';
import { AuthService } from '../../core/services/auth.service';
import { Company } from '../../core/classes/company';
import { CompanyTypesService } from '../../core/services/company-types.service';
import { CompanyType } from '../../core/classes/company_type';
import { UtilsService } from '../../shared/services/utils.service';

// npm install @ngx-translate/core --save
class UserDTO {
  username: string;
  email: string;
  password: string;
  phone:string;
  city:string;
  state:string;
  address:string;
  website:string;
  company: Company = new Company();
}

@Component({
  selector: 'app-dam-pharm-register',
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent implements OnInit, OnDestroy {
  credentials = new UserDTO();
  companyTypes: CompanyType[] | CompanyType;

  private _registerSub: Subscription = undefined;
  private _companyTypeSub: Subscription = undefined;

  constructor(
    private _utils: UtilsService,
    private _title: Title,
    private _auth: AuthService,
    private _companyTypesService: CompanyTypesService,
    public app: Config,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this._utils.unsubscribeSub(this._companyTypeSub);
    this._companyTypeSub = this._companyTypesService.get().subscribe(
      data => this.companyTypes = data,
      err => { console.log(err); }
    );

    this._title.setTitle(this.app.name);
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._registerSub);
    this._utils.unsubscribeSub(this._companyTypeSub);
  }

  onSubmit() {
    this._utils.unsubscribeSub(this._registerSub);

    console.log(JSON.stringify(this.credentials));
    this._registerSub = this._auth.register(this.credentials).subscribe();
  }

  onChangeLanguage(language: string) {
    this._utils.setLang(language);
  }

}
