
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import importApiModule from './admin/imports/api-module-import';

export const appConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideHttpClient()],
  imports: [
    ...importApiModule,
  ]
};
