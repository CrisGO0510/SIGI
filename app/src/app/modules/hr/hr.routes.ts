import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/hr-dashboard').then((m) => m.HrDashboardComponent),
  },
  {
    path: 'incapacities',
    loadChildren: () =>
      import('./incapacities/incapacities.routes').then(
        (m) => m.INCAPACITIES_ROUTES,
      ),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./documents/hr-documents').then((m) => m.HrDocumentsComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/hr-users').then((m) => m.HrUsersComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
