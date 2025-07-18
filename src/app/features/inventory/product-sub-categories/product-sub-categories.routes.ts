import type { Routes } from '@angular/router';
import { ProductSubCategoriesComponent } from './product-sub-categories.component';
import { ViewProductSubCategoryComponent } from './view-product-sub-category/view-product-sub-category.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';

export const PRODUCTSUBCATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: ProductSubCategoriesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
  {
    path: ':subCategoryId',
    component: ViewProductSubCategoryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
  },
];
