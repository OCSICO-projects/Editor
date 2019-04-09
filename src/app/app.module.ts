import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { GestureConfig } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from '@app/app.component';
import { MessageComponent } from '@app/shared/components/message/message.component';

import { AppRoutingModule } from '@app/app-routing.module';
import { ContentManagerModule } from '@app/content-manager/content-manager.module';
import { AuthModule } from '@app/auth/auth.module';
import { PlayerComponent } from '@app/player/player.component';
import { SharedModule } from '@app/shared/shared.module';
import { EditorModule } from '@app/editor/editor.module';
import { CoreModule } from '@app/core/core.module';
import { TourMatMenuModule } from 'ngx-tour-md-menu';

@NgModule({
	entryComponents: [
		MessageComponent,
	],
	declarations: [
		AppComponent,
		MessageComponent,
		PlayerComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		TranslateModule.forRoot(),
		SharedModule,
		ContentManagerModule,
		EditorModule,
		AuthModule,
		AppRoutingModule,
		CoreModule,
    TourMatMenuModule.forRoot()
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		{ provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
	]
})
export class AppModule {
}
