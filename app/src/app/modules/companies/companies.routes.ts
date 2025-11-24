import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./company-list/company-list').then((m) => m.CompanyListComponent),
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./company-form/company-form').then((m) => m.CompanyFormComponent),
  },
];
