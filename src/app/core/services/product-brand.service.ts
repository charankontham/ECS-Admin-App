import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  ProductBrand,
  ProductBrandFilters,
} from '../models/product-brand.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductBrandService extends BaseService<ProductBrand> {
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/productBrand', ngZone);
  }

  getAllBrands(): Observable<ProductBrand[]> {
    return this.getAll();
  }

  getAllBrandsByPagination(filters: ProductBrandFilters): Observable<any> {
    return this.getAllByPagination(filters, 'getAllBrandsByPagination');
  }

  getByBrandId(brandId: number): Observable<ProductBrand> {
    return this.getById(brandId);
  }

  addBrand(brand: ProductBrand): Observable<ProductBrand> {
    return this.post(brand, '');
  }

  updateBrand(brand: ProductBrand): Observable<ProductBrand> {
    return this.update(brand);
  }

  deleteBrand(brandId: number): Observable<HttpResponse<string>> {
    return this.deleteWithStringResponse(brandId);
  }
}
