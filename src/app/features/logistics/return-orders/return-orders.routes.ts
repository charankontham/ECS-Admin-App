import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { ReturnOrdersComponent } from './return-orders.component';
import { ViewReturnOrderComponent } from './view-return-order/view-return-order.component';

export const RETURN_ORDERS_ROUTES: Routes = [
  {
    path: '',
    component: ReturnOrdersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
  {
    path: ':returnOrderId',
    component: ViewReturnOrderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
];
