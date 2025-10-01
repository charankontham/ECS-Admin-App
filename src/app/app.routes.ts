import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { InventoryAdminComponent } from './features/inventory/inventory-admin.component';
import { RoleGuard } from './core/guards/role.guard';
import { MarketingAdminComponent } from './features/marketing-admin/marketing-admin.component';
import { INVENTORY_ROUTES } from '../app/features/inventory/routes/inventory.routes';
import { ImageUploaderComponent } from './features/images/image-uploader/image-uploader.component';
import { LogisticsAdminComponent } from './features/logistics/logistics-admin/logistics-admin.component';
import { LOGISTICS_ROUTES } from './features/logistics/routes/logistics.routes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
  {
    path: 'inventory',
    component: InventoryAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
    children: INVENTORY_ROUTES,

    // () =>
    //   import('../app/features/inventory/routes/inventory.routes').then(
    //     (m) => { return m.INVENTORY_ROUTES }
    //   ),
  },
  {
    path: 'logistics',
    component: LogisticsAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['logistics'] },
    children: LOGISTICS_ROUTES,
  },
  {
    path: 'marketing',
    component: MarketingAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['marketing'] },
  },
  {
    path: 'images',
    component: ImageUploaderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
  },
  { path: '**', redirectTo: 'login' },
];
