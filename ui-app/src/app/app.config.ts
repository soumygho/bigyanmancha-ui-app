import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import importApiModule from './admin/imports/api-module-import';
import { LOCAL_STORAGE_KEY } from './admin/imports/admin-const';
import { AuthTokenInterceptor } from './admin/interceptor/auth-token.interceptor';

export function tokenGetter() {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
}
export const appConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    }
  ],
  imports: [...importApiModule],
};
