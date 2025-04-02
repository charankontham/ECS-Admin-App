import { Routes } from '@angular/router';
import { ProductBrandComponent } from './product-brand.component';

export const BRANDS_ROUTES: Routes = [
  {
    path: '',
    component: ProductBrandComponent,
  },
  //   {
  //     path: 'new',
  //     component: BrandFormComponent
  //   },
  //   {
  //     path: 'edit/:id',
  //     component: BrandFormComponent
  //   }
];
