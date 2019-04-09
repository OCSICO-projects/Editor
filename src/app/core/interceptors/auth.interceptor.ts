import {
	HttpEvent,
	HttpInterceptor,
	HttpResponse,
	HttpHandler,
	HttpErrorResponse,
	HttpRequest
} from '@angular/common/http';
import { Observable, throwError as _throw } from 'rxjs';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { MessageService } from '@app/shared/services/message.service';
import { environment } from '@env/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(
		private router: Router,
		private dialog: MatDialog,
		private messageService: MessageService
	) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = localStorage.getItem('authToken');

		const request = token ? req.clone({
			headers: req.headers
				.set('Authorization', token)
		}) : req;

		const requestYouTube = req.clone({
			headers: req.headers
		});

		if (request.url.includes(environment.apiUrl)) {
			return next.handle(request)
				.pipe(
					tap((event: HttpEvent<any>) => {
						if (event instanceof HttpResponse) {
							return;
						}
					},
						error => {
							if (error instanceof HttpErrorResponse) {
								console.log('An error has occurred', error);

								if (error.status === 401) {
									this.dialog.closeAll();
									this.router.navigate(['login']);
									localStorage.clear();
									this.messageService.showErrorMessage(`Enter login and password`);
								}
								
								if (error.status === 413 || error.status === 0 || error.status === 502) {
									this.messageService.showErrorMessage(`Looks like a file size is too big! Please check the uploading file size, 50 Mb is a maximum allowable.`);
								}

								if (error.status === 500 && error.error && error.error.message) {
									this.messageService.showErrorMessage(error.error.message);
								}
							}
							return _throw(error);
						}));
		} else {
			return next.handle(requestYouTube)
		}
	}
}
