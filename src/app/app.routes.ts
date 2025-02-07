import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { InventoryAdminComponent } from './features/inventory-admin/inventory-admin.component';
import { RoleGuard } from './core/guards/role.guard';
import { LogisticsAdminComponent } from './features/logistics-admin/logistics-admin.component';
import { MarketingAdminComponent } from './features/marketing-admin/marketing-admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'inventory',
    component: InventoryAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'inventory-admin' },
  },
  {
    path: 'logistics',
    component: LogisticsAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'logistics-admin' },
  },
  {
    path: 'marketing',
    component: MarketingAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'marketing-admin' },
  },
  { path: '**', redirectTo: 'login' },
];
