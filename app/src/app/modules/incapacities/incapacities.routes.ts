import { Routes } from '@angular/router';

export const INCAPACITIES_ROUTES: Routes = [
  {
    path: 'history',
    loadComponent: () =>
      import('./incapacities-status/incapacities-status').then(
        (m) => m.IncapacitiesStatus,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./incapacity-form/incapacity-form').then((m) => m.IncapacityForm),
  },
];
