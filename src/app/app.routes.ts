import { Routes } from '@angular/router';
import { adminGuard } from './features/admin/admin.guard';

export const routes: Routes = [
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin/tenants',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/tenant-admin.component').then((m) => m.TenantAdminComponent),
  },
  {
    path: 'admin/tenants/:tenantId/catalog',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/catalog-admin.component').then((m) => m.CatalogAdminComponent),
  },
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
  {
  path: 'pagamento/cancelado',
    loadComponent: () =>
      import('./pages/cancelled/payment-cancelled.component').then(
        (m) => m.PaymentCancelledComponent,
      ),
  },
  { path: '', redirectTo: 'link-expirado', pathMatch: 'full' },
  { path: '**', redirectTo: 'link-expirado' },
];
