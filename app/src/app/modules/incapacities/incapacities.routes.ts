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
      import('./incapacities-status/incapacities-status').then(
        (m) => m.IncapacitiesStatus,
      ),
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./incapacity-form/incapacity-form').then((m) => m.IncapacityForm),
  },
];
