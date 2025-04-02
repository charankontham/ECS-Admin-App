import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { ProductBrand } from '../models/product-brand.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductBrandService extends BaseService<ProductBrand> {
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/productBrand', ngZone);
    // this.headers = new HttpHeaders({
    //   Authorization: 'Bearer ' + authService.decryptData(localStorage.getItem('userToken') || ""),
    // });
  }

  getAllProducts(): Observable<ProductBrand[]> {
    return this.getAll();
  }
}
