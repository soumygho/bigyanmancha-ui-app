import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { JwtHelperService } from './jwt-helper.service';
import { jwtDecode } from 'jwt-decode';
import { JWTClaims } from '../imports/app-state-import';
import { LOCAL_STORAGE_KEY } from '../imports/admin-const';
import { StateManagerService } from './state-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly jwtHelperService = inject(JwtHelperService);
  private readonly stateManagerService = inject(StateManagerService);
  private readonly ADMIN_ROLE = 'ROLE_ADMIN';
  private readonly VIGYANKENDRA_ROLE = 'ROLE_VIGYANKENDRA';
  private readonly SCHOOL_ROLE = 'ROLE_SCHOOL';
  private readonly NONE_ROLE = 'ROLE_NONE';

  private tokenSignal = signal<string | null>(
    localStorage.getItem(LOCAL_STORAGE_KEY)
  );

  private _isAuthenticatedSignal = signal<boolean>(false);
  isAuthenticatedSignal = computed(() => this._isAuthenticatedSignal());

  getToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  }

  getPermissions(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const decoded = jwtDecode<JWTClaims>(token);
      return decoded.roles || [];
    } catch (err) {
      console.error('Invalid JWT:', err);
      return [];
    }
  }

  getClaims(): JWTClaims | undefined {
    const token = this.getToken();
    if (!token) return undefined;

    try {
      const decoded = jwtDecode<JWTClaims>(token);
      return decoded;
    } catch (err) {
      console.error('Invalid JWT:', err);
      return undefined;
    }
  }

  isAuthenticated(): boolean {
    let token = localStorage.getItem(LOCAL_STORAGE_KEY);
    let isLoggedIn = (
      !!token &&
      !this.jwtHelperService.isTokenExpired(token)
    );
    this._isAuthenticatedSignal.set(isLoggedIn);
    return isLoggedIn;
  }

  isAdminUser(): boolean {
    return this.getPermissions().includes(this.ADMIN_ROLE);
  }

  isVigyanKendraUser(): boolean {
    return this.getPermissions().includes(this.VIGYANKENDRA_ROLE);
  }

  isVigyanKendraUserOrAdmin(): boolean {
    return this.isVigyanKendraUser() || this.isAdminUser();
  }

  getVigyanKendraId(): string {
    const claims = this.getClaims();
    if (!claims) return '';
    return claims.vigyanKendraId;
  }

  getVigyanKendraCode(): string {
    const claims = this.getClaims();
    if (!claims) return '';
    return claims.vigyanKendraCode;
  }

  getVigyanKendraName(): string {
    const claims = this.getClaims();
    if (!claims) return '';
    return claims.vigyanKendraName;
  }

  logout() {
    this._isAuthenticatedSignal.set(false);
    this.tokenSignal.set(null);
    this.localStorageService.deleteLoggedInUserState();
  }
  login(token: string) {
    this._isAuthenticatedSignal.set(true);
    this.tokenSignal.set(token);
    this.stateManagerService.initializeGlobalState();
  }
}
