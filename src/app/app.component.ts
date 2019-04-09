import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TourService } from 'ngx-tour-md-menu';
import { takeUntil } from 'rxjs/operators';

import { SplashScreenService } from '@app/shared/services/splash-screen.service';
import { TranslationLoaderService } from '@app/shared/services/translation-loader.service';
import { MessageService } from '@app/shared/services/message.service';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { locale as enTranslations } from 'assets/i18n/en';
import { Message } from '@app/shared/models/message.model';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy{
	onDestroy$ = new Subject();
	public hideStep: boolean;
	public disabledStep: boolean;

	private HIDE_SUCCESS_MSG_TIMEOUT = 4000;

	messageDialogRef: MatDialogRef<MessageComponent>;

	constructor(
		private translate: TranslateService,
		private SplashScreen: SplashScreenService,
		private TranslationLoader: TranslationLoaderService,
		private messageService: MessageService,
		public tourService: TourService,
		public dialog: MatDialog
	) { 
		// Add languages
		this.translate.addLangs(['en']);

		// Set the default language
		this.translate.setDefaultLang('en');

		// Set the navigation translations
		this.TranslationLoader.loadTranslations(enTranslations);

		// Use a language
		this.translate.use('en');

		this.tourService.stepShow$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe((step) => {
				this.hideStep = step.stepId === 'editor-object-settings' ? true : false;
				this.disabledStep = step.stepId === 'editor-header-add' ? true : false;
			});

		this.messageService.errorMessage$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe((message: Message) => {
				this.messageDialogRef = this.dialog.open(MessageComponent, { autoFocus: false ,data: message });
				this.messageDialogRef.afterClosed().subscribe(() => this.messageService.emitMessageClosed());
			});

		this.messageService.successMessage$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe((message: Message) => {
				this.messageDialogRef = this.dialog.open(MessageComponent, { autoFocus: false, data: message });
				this.messageDialogRef.afterClosed().subscribe(() => this.messageService.emitMessageClosed());

				setTimeout(() => {
					this.messageDialogRef.close();
				}, this.HIDE_SUCCESS_MSG_TIMEOUT);
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
