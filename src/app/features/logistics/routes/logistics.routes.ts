import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { LogisticsDashboardComponent } from '../logistics-dashboard/logistics-dashboard.component';

export const LOGISTICS_ROUTES: Routes = [
  {
    path: '',
    component: LogisticsDashboardComponent,
  },
  {
    path: 'dashboard',
    component: LogisticsDashboardComponent,
  },
  {
    path: 'orders',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
    loadChildren: () =>
      import('../order-items/orders.routes').then((m) => m.ORDER_ITEM_ROUTES),
  },
  {
    path: 'delivery-hubs',
    data: { role: 'admin', subRoles: ['logistics'] },
    loadChildren: () =>
      import('../delivery-hubs/delivery-hubs.routes').then(
        (m) => m.DELIVERY_HUBS_ROUTES
      ),
  },
  {
    path: 'delivery-agents',
    data: { role: 'admin', subRoles: ['logistics'] },
    loadChildren: () =>
      import('../delivery-agents/delivery-agents.routes').then(
        (m) => m.DELIVERY_AGENTS_ROUTES
      ),
  },
  {
    path: 'deliveries',
    data: { role: 'admin', subRoles: ['logistics'] },
    loadChildren: () =>
      import('../deliveries/deliveries.routes').then(
        (m) => m.DELIVERIES_ROUTES
      ),
  },
  {
    path: 'return-orders',
    data: { role: 'admin', subRoles: ['logistics'] },
    loadChildren: () =>
      import('../return-orders/return-orders.routes').then(
        (m) => m.RETURN_ORDERS_ROUTES
      ),
  },
  {
    path: 'images',
    loadChildren: () =>
      import('../../images/images.routes').then((m) => m.IMAGES_ROUTES),
  },
];
