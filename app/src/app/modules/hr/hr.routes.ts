import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/hr-dashboard').then(
        (m) => m.HrDashboardComponent,
      ),
  },
  {
    path: 'management',
    loadComponent: () =>
      import('./management/hr-management').then(
        (m) => m.HrManagementComponent,
      ),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./documents/hr-documents').then(
        (m) => m.HrDocumentsComponent,
      ),
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
