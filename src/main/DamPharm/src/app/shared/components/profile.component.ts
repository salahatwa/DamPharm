import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../core/classes/user';
import { ProfileService } from '../../core/services/profile.service';
import { UtilsService } from '../services/utils.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dam-pharm-profile-edit',
  templateUrl: './profile.component.html',
  styles: [],
  providers: [ProfileService]
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;

  @Input() user: User;
  @Output() change: EventEmitter<User> = new EventEmitter<User>();

  constructor(
    private _profileService: ProfileService,
    private _utils: UtilsService,
    private _auth:AuthService,
    public translate: TranslateService
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  onSubmit() {
    this.user.password=this.user.oldpassword;
    this._sub = this._profileService.update(this.user)
      .subscribe(data => {
        this.change.emit(data);
        this._auth.getUser().subscribe(data=>
          {
            this.user=data;
            console.log(JSON.stringify(this.user));
          }
          ,error=>console.log('Error during update user'));
      });
  }

}
