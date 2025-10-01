import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { ImageUsageExampleComponent } from '../../images/image-usage-example/image-usage-example.component';
import { ImageGalleryComponent } from '../../images/image-gallery/image-gallery.component';
import { ImageUploaderComponent } from '../../images/image-uploader/image-uploader.component';
import { LogisticsDashboardComponent } from '../logistics-dashboard/logistics-dashboard.component';

export const LOGISTICS_ROUTES: Routes = [
  {
    path: '',
    component: LogisticsDashboardComponent,
  },
  {
    path: 'dashboard',
    component: LogisticsDashboardComponent,
  },
  //   {
  //     path: 'products',
  //     canActivate: [AuthGuard, RoleGuard],
  //     data: { role: 'admin', subRoles: ['inventory'] },
  //     loadChildren: () =>
  //       import('../products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  //   },
  //   {
  //     path: 'categories',
  //     loadChildren: () =>
  //       import('../product-category/product-category.routes').then(
  //         (m) => m.CATEGORIES_ROUTES
  //       ),
  //   },
  //   {
  //     path: 'sub-categories',
  //     loadChildren: () =>
  //       import('../product-sub-categories/product-sub-categories.routes').then(
  //         (m) => m.PRODUCTSUBCATEGORIES_ROUTES
  //       ),
  //   },
  //   {
  //     path: 'brands',
  //     loadChildren: () =>
  //       import('../product-brand/product-brand.routes').then(
  //         (m) => m.BRANDS_ROUTES
  //       ),
  //   },
  //   {
  //     path: 'analytics',
  //     loadChildren: () =>
  //       import('../analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  //   },
  // {
  //   path: 'images',
  //   // component: ImageGalleryComponent,
  //   loadChildren: () =>
  //     import('../../images/images.routes').then((m) => m.IMAGES_ROUTES),
  // },
];
