import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { OrderItemsComponent } from './order-items.component';
import { ViewOrderItemComponent } from './view-order-item/view-order-item.component';

export const ORDER_ITEM_ROUTES: Routes = [
  {
    path: '',
    component: OrderItemsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
  {
    path: ':orderItemId',
    component: ViewOrderItemComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
];
