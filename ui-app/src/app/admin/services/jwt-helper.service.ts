import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class JwtHelperService {
  constructor() {}

  isTokenExpired(token: string | null): boolean {
    console.trace('token from util : '+token);
    if (!token) return true;

    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      console.trace('exp value : '+exp);
      const isExpired = exp < Date.now() / 1000;
      console.trace('isExpired : '+isExpired);
      return isExpired;
    } catch {
      return true;
    }
  }
}
