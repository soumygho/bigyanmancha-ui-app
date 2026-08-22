import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Subject, interval } from 'rxjs';
import {
  catchError,
  exhaustMap,
  startWith,
  takeUntil
} from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService implements OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private readonly healthCheckUrl =
    `${environment.apiBaseUrl}/api/hello`;

  constructor(private http: HttpClient) {}

  startHealthCheck(): void {
    interval(40000)
      .pipe(
        startWith(0), // Perform the first health check immediately
        takeUntil(this.destroy$),
        exhaustMap(() =>
          this.http.get(this.healthCheckUrl).pipe(
            catchError(error => {
              console.error('Health check failed:', error);
              return EMPTY;
            })
          )
        )
      )
      .subscribe(response => {
        console.log('Health check response:', response);
      });
  }

  stopHealthCheck(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy(): void {
    this.stopHealthCheck();
  }
}
