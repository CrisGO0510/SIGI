import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, publicGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

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
        path: 'hr',
        canActivate: [roleGuard(['RRHH', 'ADMIN'])],
        loadChildren: () =>
          import('./modules/hr/hr.routes').then((m) => m.HR_ROUTES),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './modules/employment/dashboard/home-dashboard/home-dashboard'
          ).then((m) => m.HomeDashboard),
      },
      {
        path: 'incapacities',
        loadChildren: () =>
          import('./modules/employment/incapacities/incapacities.routes').then(
            (r) => r.INCAPACITIES_ROUTES,
          ),
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('./modules/employment/documents/document.routes').then(
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
