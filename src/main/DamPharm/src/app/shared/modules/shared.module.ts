import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';
import { NavbarComponent } from '../components/navbar.component';
import { SidebarComponent } from '../components/sidebar.component';
import { EditProfileComponent } from '../components/profile.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PageLoaderComponent } from '../../core/classes/page-loader/page-loader.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxPaginationModule
  ],
  declarations: [
    NavbarComponent,
    SidebarComponent,
    EditProfileComponent,
    PageLoaderComponent
  ],
  providers: [UtilsService],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    SidebarComponent,
    NguiAutoCompleteModule,
    TranslateModule,
    NgxPaginationModule,
    PageLoaderComponent
  ]
})
export class SharedModule { }
