import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { OrdersComponent } from './orders.component';
import { ViewOrderComponent } from './view-order/view-order.component';

export const ORDER_ITEM_ROUTES: Routes = [
  {
    path: '',
    component: OrdersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
  {
    path: ':orderId',
    component: ViewOrderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
];
