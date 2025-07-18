import { Routes } from '@angular/router';
import { InventoryDashboardComponent } from '../inventory-dashboard/inventory-dashboard.component';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { ImageUsageExampleComponent } from '../../images/image-usage-example/image-usage-example.component';
import { ImageGalleryComponent } from '../../images/image-gallery/image-gallery.component';
import { ImageUploaderComponent } from '../../images/image-uploader/image-uploader.component';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryDashboardComponent,
  },
  {
    path: 'dashboard',
    component: InventoryDashboardComponent,
  },
  {
    path: 'products',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory'] },
    loadChildren: () =>
      import('../products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('../product-category/product-category.routes').then(
        (m) => m.CATEGORIES_ROUTES
      ),
  },
  {
    path: 'sub-categories',
    loadChildren: () =>
      import('../product-sub-categories/product-sub-categories.routes').then(
        (m) => m.PRODUCTSUBCATEGORIES_ROUTES
      ),
  },
  {
    path: 'brands',
    loadChildren: () =>
      import('../product-brand/product-brand.routes').then(
        (m) => m.BRANDS_ROUTES
      ),
  },
  {
    path: 'analytics',
    loadChildren: () =>
      import('../analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  },
  {
    path: 'images',
    // component: ImageGalleryComponent,
    loadChildren: () =>
      import('../../images/images.routes').then((m) => m.IMAGES_ROUTES),
  },
];
