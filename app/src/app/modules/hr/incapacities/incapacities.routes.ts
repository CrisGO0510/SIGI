import { Routes } from '@angular/router';

export const INCAPACITIES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'history',
    pathMatch: 'full',
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./hr-incapacities-status/hr-incapacities-status').then(
        (m) => m.IncapacitiesStatus,
      ),
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./hr-incapacity-form/hr-incapacity-form').then(
        (m) => m.HrIncapacityForm,
      ),
  },
];
