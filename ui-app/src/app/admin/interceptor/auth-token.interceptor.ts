// auth-token.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { LOCAL_STORAGE_KEY } from '../imports/admin-const';
import blobToJson from './blob-to-json-utility';
import { LoadingSpinnerService } from '../services/loading-spinner.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AdminAuthService);
  private spinnerService = inject(LoadingSpinnerService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const isHealthCheckRequest = req.url.includes('/api/hello');
    if (!isHealthCheckRequest) {
      this.spinnerService.show();
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEY);

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next
      .handle(authReq)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Optional: Show a message/snackbar here
            this.notificationService.show(
              'Session expired, please login again to continue.',
            );
            // Clear any stored tokens
            this.authService.logout();
            // Redirect to login or unauthorized page
            this.router.navigate(['/admin/login']); // or `/unauthorized`
          } else {
            if (!isHealthCheckRequest) {
              if (error?.error) {
                if (error.error instanceof Blob) {
                  blobToJson(error.error).then((json) => {
                    this.notificationService.show(json?.message);
                  });
                } else {
                  if (error.error.message) {
                    this.notificationService.show(error.error.message);
                  } else {
                    this.notificationService.show(
                      `There is some error occured in the server while processing your request.`,
                    );
                  }
                }
              }
            }
          }
          return throwError(() => error);
        }),
      )
      .pipe(finalize(() => {
        if (!isHealthCheckRequest) {
          this.spinnerService.hide()
        }
      }));
  }
}
