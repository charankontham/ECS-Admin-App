import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { ProductFilters } from '../models/product.model';
import { OrderFilters, OrderReturnFilters } from '../models/order.model';
import {
  DeliveryAgentFilters,
  DeliveryHubFilters,
} from '../models/delivery.model';

export interface ProductsPageState {
  filters: ProductFilters;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface BrandsPageState {
  filters: any;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface CategoriesPageState {
  filters: any;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface SubCategoriesPageState {
  filters: any;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface OrdersPageState {
  filters: OrderFilters;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface DeliveryHubsPageState {
  filters: DeliveryHubFilters;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface OrderReturnsPageState {
  filters: OrderReturnFilters;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

export interface DeliveryAgentsPageState {
  filters: DeliveryAgentFilters;
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
  private brandsPageState = new BehaviorSubject<BrandsPageState | null>(null);
  private categoriesPageState = new BehaviorSubject<CategoriesPageState | null>(
    null
  );
  private subCategoriesPageState =
    new BehaviorSubject<SubCategoriesPageState | null>(null);
  private ordersPageState = new BehaviorSubject<OrdersPageState | null>(null);
  private deliveryHubsPageState =
    new BehaviorSubject<DeliveryHubsPageState | null>(null);
  private deliveryAgentsPageState =
    new BehaviorSubject<DeliveryAgentsPageState | null>(null);
  private orderReturnsPageState =
    new BehaviorSubject<OrderReturnsPageState | null>(null);
  getProductsPageState() {
    return this.productsPageState.asObservable();
  }

  setProductsPageState(state: ProductsPageState) {
    this.productsPageState.next(state);
  }

  clearProductsPageState() {
    this.productsPageState.next(null);
  }

  getOrdersPageState() {
    return this.ordersPageState.asObservable();
  }

  setOrdersPageState(state: OrdersPageState) {
    this.ordersPageState.next(state);
  }

  clearOrdersPageState() {
    this.ordersPageState.next(null);
  }

  getBrandsPageState() {
    return this.brandsPageState.asObservable();
  }

  setBrandsPageState(state: BrandsPageState) {
    this.brandsPageState.next(state);
  }

  clearBrandsPageState() {
    this.brandsPageState.next(null);
  }

  getCategoriesPageState() {
    return this.categoriesPageState.asObservable();
  }

  setCategoriesPageState(state: CategoriesPageState) {
    this.categoriesPageState.next(state);
  }

  clearCategoriesPageState() {
    this.categoriesPageState.next(null);
  }

  getSubCategoriesPageState() {
    return this.subCategoriesPageState.asObservable();
  }

  setSubCategoriesPageState(state: SubCategoriesPageState) {
    this.subCategoriesPageState.next(state);
  }

  clearSubCategoriesPageState() {
    this.subCategoriesPageState.next(null);
  }

  getDeliveryHubsPageState() {
    return this.deliveryHubsPageState.asObservable();
  }

  setDeliveryHubsPageState(state: DeliveryHubsPageState) {
    this.deliveryHubsPageState.next(state);
  }

  clearDeliveryHubsPageState() {
    this.deliveryHubsPageState.next(null);
  }

  getDeliveryAgentsPageState() {
    return this.deliveryAgentsPageState.asObservable();
  }

  setDeliveryAgentsPageState(state: DeliveryAgentsPageState) {
    this.deliveryAgentsPageState.next(state);
  }

  clearDeliveryAgentsPageState() {
    this.deliveryAgentsPageState.next(null);
  }

  getOrderReturnsPageState() {
    return this.orderReturnsPageState.asObservable();
  }

  setOrderReturnsPageState(state: OrderReturnsPageState) {
    this.orderReturnsPageState.next(state);
  }

  clearOrderReturnsPageState() {
    this.orderReturnsPageState.next(null);
  }
}
