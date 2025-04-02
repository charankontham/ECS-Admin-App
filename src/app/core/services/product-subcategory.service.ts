import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  ProductCategory,
  SubCategory,
  SubCategoryEnriched,
} from '../models/product-category.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductSubCategoryService extends BaseService<SubCategory> {
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/subCategory', ngZone);
    // this.headers = new HttpHeaders({
    //   Authorization: 'Bearer ' + localStorage.getItem('userToken'),
    // });
  }

  getAllProducts(): Observable<SubCategory[]> {
    return this.getAll();
  }

  getSubCategoriesByCategoryId(
    resource: string,
    categoryId: number
  ): Observable<SubCategory[]> {
    return this.getAllByPath(resource, categoryId);
  }
}
