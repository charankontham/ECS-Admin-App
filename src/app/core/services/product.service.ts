import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService<Product> {
  constructor() {
    super('products');
  }
}
