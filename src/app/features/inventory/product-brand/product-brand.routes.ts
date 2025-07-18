import { Routes } from '@angular/router';
import { ProductBrandComponent } from './product-brand.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { ViewBrandComponent } from './view-brand/view-brand.component';

export const BRANDS_ROUTES: Routes = [
  {
    path: '',
    component: ProductBrandComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
  {
    path: ':brandId',
    component: ViewBrandComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
];
