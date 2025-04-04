import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { ProductCategory } from '../models/product-category.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService extends BaseService<ProductCategory> {
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/productCategory', ngZone);
    // this.headers = new HttpHeaders({
    //   Authorization: 'Bearer ' + localStorage.getItem('userToken'),
    // });
  }

  getAllProducts(): Observable<ProductCategory[]> {
    return this.getAll();
  }
}
