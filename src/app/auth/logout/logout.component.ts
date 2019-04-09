import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '@app/shared/models/user.model';
import { UserService } from '@app/core/services/user.service';
import { AuthService } from '@app/auth/auth.service';
import { JwtService } from '@app/auth/jwt.service';

@Component({
	selector: 'app-logout',
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
	user: User;
	visible: boolean;

	constructor(
		private userService: UserService,
		private authService: AuthService,
		private jwtService: JwtService,
		private router: Router
	) { }

	ngOnInit() {
		this.initUser();
		this.visible = false;
	}

	initUser() {
		this.userService.getUser()
			.subscribe(data => {
				this.user = data[0];
				this.user.avatar_name = this.user.name.match(/\b\w/g).join('');
			});
	}

	onClickedOutside(e: Event) {
		this.visible = e ? false : true;
	}

	public logout() {
		this.authService.logout()
			.subscribe(
				data => {
					this.jwtService.destroyToken();
					this.router.navigate(['login']);
					localStorage.clear();
					location.reload();
				}
			)
	}

}
