import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: 'incapacities',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/incapacities/incapacities.routes').then(
        (m) => m.INCAPACITIES_ROUTES,
      ),
  },

  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];
