import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { ProductFilters } from '../models/product.model';

export interface ProductsPageState {
  filters: ProductFilters;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationStateService {
  private productsPageState = new BehaviorSubject<ProductsPageState | null>(
    null
  );

  getProductsPageState() {
    return this.productsPageState.asObservable();
  }

  setProductsPageState(state: ProductsPageState) {
    this.productsPageState.next(state);
  }

  clearProductsPageState() {
    this.productsPageState.next(null);
  }
}
