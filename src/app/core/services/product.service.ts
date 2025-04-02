import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Product, ProductFilters } from '../models/product.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService<Product> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-product/api/product', ngZone);
    // this.headers = new HttpHeaders({
    //   Authorization: 'Bearer ' + localStorage.getItem('userToken'),
    // });
  }

  getAllProducts(): Observable<Product[]> {
    return this.getAll();
  }

  getAllProductsBypagination(filters: ProductFilters): Observable<any> {
    return this.getAllByPagination(filters, 'getProductsByPagination');
  }

  getAllProductsByProductCategory(categoryId: number): Observable<Product[]> {
    return this.getAllByPath('getProductsByCategoryId', categoryId);
  }

  getAllProductsByProductBrandId(brandId: number): Observable<Product[]> {
    return this.getAllByPath('getProductsByBrandId', brandId);
  }

  getProductById(productId: number): Observable<Product> {
    return this.getById(productId);
  }

  addProduct(product: Product): Observable<Product | string> {
    return this.post(product, '');
  }

  updateProduct(product: Product): Observable<Product[]> {
    var products: Product[] = [];
    products.push(product);
    return this.updateAll(products);
  }

  deleteProducts(productIds: number[]): void {
    productIds.forEach((productId: number) => {
      this.deleteWithStringResponse(productId);
    });
  }
}
