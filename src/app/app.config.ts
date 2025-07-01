import { ApplicationConfig, importProvidersFrom, inject, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { AuthInterceptor } from './services/auth.interceptor';
import { UserStateService } from './services/user-state.service';
import { routes } from './app.routes';

// Factory function para inicializar el UserStateService
function initializeUserStateService(): () => void {
  return () => {
    const userStateService = inject(UserStateService);
    console.log('UserStateService inicializado para manejo de persistencia de usuario');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    importProvidersFrom(SidebarModule, DropdownModule),
    IconSetService,
    provideAnimationsAsync(),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(ReactiveFormsModule),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: initializeUserStateService, multi: true }
  ]
};
