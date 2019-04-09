import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';

import { User } from '@app/shared/models/user.model';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private apiUrl = environment.apiUrl;

	constructor(public http: HttpClient) {
	}

	public signIn(user: User): any {
		return this.http.post(`${this.apiUrl}/auth/login`, user);
	}

	public logout() {
    return this.http.get(`${this.apiUrl}/auth/logout`);
  }
}
