import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  Order,
  OrderFilters,
  OrderItem,
  OrderItemFilters,
  OrderRequest,
} from '../models/order.model';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseService<Order> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-order/api/order', ngZone);
  }

  getAllOrdersBypagination(filters: OrderFilters): Observable<any> {
    return this.getAllByPagination(filters, 'getAllByPagination');
  }

  getAllOrderItemsBypagination(filters: OrderItemFilters): Observable<any> {
    return this.getAllByPagination(
      filters,
      'getOrderItemsByProductIdWithPagination'
    );
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.getById(orderId);
  }

  updateOrder(orderRquest: OrderRequest): Observable<Order> {
    return this.update(orderRquest);
  }
}
