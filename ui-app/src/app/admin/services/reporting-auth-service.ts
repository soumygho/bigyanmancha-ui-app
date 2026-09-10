import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { JwtResponse, LoginRequest } from '../../api/models';

export const REPORTING_SERVER_TOKEN = 'reporting-server-token';

@Injectable({
  providedIn: 'root',
})
export class ReportingAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.reportingBaseUrl;

  authenticate(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>(
        `${this.baseUrl}/api/auth/signin`,
        credentials,
      )
      .pipe(
        tap((response) => {
          if (response.jwt) {
            sessionStorage.setItem(REPORTING_SERVER_TOKEN, response.jwt);
          }
        }),
      );
  }

  getToken(): string | null {
    return sessionStorage.getItem(REPORTING_SERVER_TOKEN);
  }

  clearToken(): void {
    sessionStorage.removeItem(REPORTING_SERVER_TOKEN);
  }
}
