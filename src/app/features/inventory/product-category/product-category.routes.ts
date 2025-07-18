import { Routes } from '@angular/router';
import { ProductCategoryComponent } from './product-category.component';
import { ViewProductCategory } from './view-product-component/view-product-category.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: ProductCategoryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
  {
    path: ':productCategoryId',
    component: ViewProductCategory,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
];
