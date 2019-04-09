import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Message } from '@app/shared/models/message.model';
import { ConfigType } from '@app/constants/config-type';

@Injectable({
	providedIn: 'root'
})
export class MessageService {
	defaultSuccessMessageKey = 'MESSAGES.DEFAULT_SUCCESS_MESSAGE';
	defaultErrorMessageKey = 'MESSAGES.DEFAULT_ERROR_MESSAGE';

	private errorMessageSource = new Subject<any>();
	errorMessage$: Observable<any> = this.errorMessageSource.asObservable();
	private successMessageSource = new Subject<Message>();
	successMessage$: Observable<any> = this.successMessageSource.asObservable();
	private messageClosedSource = new Subject<void>();
	messageClosed$: Observable<void> = this.messageClosedSource.asObservable();

	showSuccessMessage(message?: string) {
		let shouldBeTranslated = false;
		if (!message) {
			message = this.defaultSuccessMessageKey;
			shouldBeTranslated = true;
		}
		const messageObj = new Message({ message: message, type: ConfigType.typeSuccess, shouldBeTranslated: shouldBeTranslated });
		this.successMessageSource.next(messageObj);

		return this.messageClosed$.pipe(first());
	}

	showErrorMessage(message?: string) {
		let shouldBeTranslated = false;
		if (!message) {
			message = this.defaultErrorMessageKey;
			shouldBeTranslated = true;
		}
		const messageObj = new Message({ message: message, type: ConfigType.typeError, shouldBeTranslated: shouldBeTranslated });
		this.errorMessageSource.next(messageObj);

		return this.messageClosed$.pipe(first());
	}

	emitMessageClosed() {
		this.messageClosedSource.next();
	}
}
