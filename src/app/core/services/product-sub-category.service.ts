import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  ProductCategory,
  SubCategory,
  SubCategoryEnriched,
  SubCategoryFilters,
} from '../models/product-category.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductSubCategoryService extends BaseService<SubCategory> {
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/subCategory', ngZone);
  }

  getAllSubCategories(): Observable<SubCategory[]> {
    return this.getAll();
  }

  getAllSubCategoriesByPagination(
    filters: SubCategoryFilters
  ): Observable<any> {
    return this.getAllByPagination(filters, 'getAllSubCategoriesByPagination');
  }

  getSubCategoriesByCategoryId(categoryId: number): Observable<SubCategory[]> {
    return this.getAllByPath('getByCategoryId', categoryId);
  }

  getSubCategoryById(subCategoryId: number): Observable<SubCategory> {
    return this.getById(subCategoryId);
  }

  addSubCategory(subCategory: SubCategory): Observable<SubCategory> {
    return this.post(subCategory, '');
  }

  updateSubCategory(subCategory: SubCategory): Observable<SubCategory> {
    return this.update(subCategory);
  }

  deleteSubCategoryById(
    subCategoryId: number
  ): Observable<HttpResponse<string>> {
    return this.deleteWithStringResponse(subCategoryId);
  }
}
