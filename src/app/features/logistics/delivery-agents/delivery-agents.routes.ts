import { Routes } from '@angular/router';
import { RoleGuard } from '../../../core/guards/role.guard';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { DeliveryAgentsComponent } from './delivery-agents.component';
import { ViewDeliveryAgentComponent } from './view-delivery-agent/view-delivery-agent.component';

export const DELIVERY_AGENTS_ROUTES: Routes = [
  {
    path: '',
    component: DeliveryAgentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
  {
    path: ':orderItemId',
    component: ViewDeliveryAgentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
  },
];
