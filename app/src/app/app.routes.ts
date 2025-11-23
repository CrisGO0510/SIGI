import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, publicGuard } from './core/guards/auth-guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/home-dashboard/home-dashboard').then(
            (m) => m.HomeDashboard,
          ),
      },
      {
        path: 'incapacities',
        loadChildren: () =>
          import('./modules/incapacities/incapacities.routes').then(
            (r) => r.INCAPACITIES_ROUTES,
          ),
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('./modules/documents/document.routes').then(
            (r) => r.DOCUMENTS_ROUTES,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  // {
  //   path: '**',
  //   redirectTo: 'dashboard',
  // },
];
