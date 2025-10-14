import { Routes } from '@angular/router';
import { DeliveryHubsComponent } from './delivery-hubs.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { ViewDeliveryHubComponent } from './view-delivery-hub/view-delivery-hub.component';

export const DELIVERY_HUBS_ROUTES: Routes = [
  {
    path: '',
    component: DeliveryHubsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
  {
    path: ':deliveryHubId',
    component: ViewDeliveryHubComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
];
