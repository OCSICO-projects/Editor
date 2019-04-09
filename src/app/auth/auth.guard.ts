import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private jwtService: JwtService
  ) { }

  canActivate() {
    const token = this.jwtService.getToken();

    if (token) {
      return true;
    } else {
      this.router.navigate(['login']);
      this.jwtService.destroyToken();
      return false;
    }
  }
}
