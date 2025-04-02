import { Routes } from '@angular/router';
import { ProductCategoryComponent } from './product-category.component';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: ProductCategoryComponent,
  },
  //   {
  //     path: 'new',
  //     component: CategoryFormComponent
  //   },
  //   {
  //     path: 'edit/:id',
  //     component: CategoryFormComponent
  //   }
];
