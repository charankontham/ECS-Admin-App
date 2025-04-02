import { Routes } from '@angular/router';
import { InventoryDashboardComponent } from '../inventory-dashboard/inventory-dashboard.component';

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
];
