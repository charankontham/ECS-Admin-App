import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsComponent,
  },
  //   {
  //     path: 'new',
  //     component: ProductFormComponent
  //   },
  //   {
  //     path: 'edit/:id',
  //     component: ProductFormComponent
  //   },
  //   {
  //     path: ':id',
  //     component: ProductDetailsComponent
  //   }
];
