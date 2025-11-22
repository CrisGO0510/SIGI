import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then(
        (r) => r.DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'incapacities',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/incapacities/incapacities.routes').then(
        (r) => r.INCAPACITIES_ROUTES,
      ),
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
];
