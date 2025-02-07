import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ProductCategory } from '../models/product-category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseService<ProductCategory> {
  constructor() {
    super('categories');
  }
}
