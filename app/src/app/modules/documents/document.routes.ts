import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'viewer',
    pathMatch: 'full',
  },
  {
    path: 'viewer',
    loadComponent: () =>
      import('./viewer/viewer').then(
        (m) => m.Viewer,
      ),
  },
  {
    path: 'uploader',
    loadComponent: () =>
      import('./uploader/uploader').then(
        (m) => m.Uploader,
      ),
  },
];
