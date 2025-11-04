import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  ProductCategory,
  ProductCategoryFiletrs,
} from '../models/product-category.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService extends BaseService<ProductCategory> {
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/productCategory', ngZone);
  }

  addCategory(category: ProductCategory): Observable<ProductCategory> {
    return this.post(category, '');
  }

  getByCategoryId(categoryId: number): Observable<ProductCategory> {
    return this.getById(categoryId);
  }

  getAllCategories(): Observable<ProductCategory[]> {
    return this.getAll();
  }

  getAllCategoriesByPagination(
    filters: ProductCategoryFiletrs
  ): Observable<any> {
    return this.getAllByPagination(filters, 'getAllCategoriesByPagination');
  }

  updateCategory(category: ProductCategory): Observable<ProductCategory> {
    return this.update(category);
  }

  deleteCategory(id: number): Observable<HttpResponse<string>> {
    return this.deleteWithStringResponse(id);
  }
}
