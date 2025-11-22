import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'forgot',
    loadComponent: () =>
      import('./forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
];
