import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideModule } from 'ng-click-outside';

import { LoginComponent } from '@app/auth/login/login.component';
import { LogoutComponent } from '@app/auth/logout/logout.component';

import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
		SharedModule,
		ClickOutsideModule
	],
	exports: [
		LogoutComponent
	],
  declarations: [
    LoginComponent,
    LogoutComponent,
  ]
})
export class AuthModule { }
