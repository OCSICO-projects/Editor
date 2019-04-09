import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  tokenKey = 'authToken';

  constructor() { }

  public getToken(): string {
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: any) {
    localStorage.setItem(this.tokenKey, `Bearer ${token}`);
  }

  public destroyToken() {
    localStorage.removeItem(this.tokenKey);
  }
}
