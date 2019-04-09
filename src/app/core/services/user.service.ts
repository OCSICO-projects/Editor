import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private currentUser = environment.currentUser;

	constructor(private apiService: ApiService) { }

	public getUser() {
		return this.apiService.get(this.currentUser);
	}
}
