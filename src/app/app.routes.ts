import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'a/:token',
    loadComponent: () =>
      import('./features/booking/pages/booking-flow-page.component').then(
        (m) => m.BookingFlowPageComponent,
      ),
  },
  {
    path: 'link-expirado',
    loadComponent: () =>
      import('./pages/expired-link/expired-link.component').then((m) => m.ExpiredLinkComponent),
  },
  {
    path: 'confirmacao',
    loadComponent: () =>
      import('./pages/confirmation/confirmation.component').then((m) => m.ConfirmationComponent),
  },
  { path: '', redirectTo: 'link-expirado', pathMatch: 'full' },
  { path: '**', redirectTo: 'link-expirado' },
];
