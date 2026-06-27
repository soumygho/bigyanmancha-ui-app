import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class JwtHelperService {
  constructor() {}

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      const isExpired = exp < Date.now() / 1000;
      return isExpired;
    } catch {
      return true;
    }
  }
}
