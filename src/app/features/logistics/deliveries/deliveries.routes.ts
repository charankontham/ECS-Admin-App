import { Routes } from '@angular/router';
import { RoleGuard } from '../../../core/guards/role.guard';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { DeliveriesComponent } from './deliveries.component';
import { ViewDeliveryComponent } from './view-delivery/view-delivery.component';

export const DELIVERIES_ROUTES: Routes = [
  {
    path: '',
    component: DeliveriesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
  {
    path: ':orderItemId',
    component: ViewDeliveryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
];
