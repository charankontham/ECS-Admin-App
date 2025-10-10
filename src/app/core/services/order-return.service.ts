import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  Order,
  OrderFilters,
  OrderItemFilters,
  OrderRequest,
  OrderReturn,
  OrderReturnFilters,
  OrderTracking,
  OrderTrackingFilters,
  OrderTrackingRequest,
} from '../models/order.model';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderReturnsService extends BaseService<OrderReturn> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-logistics/api/orderReturns', ngZone);
  }

  getAllOrderReturnsBypagination(filters: OrderReturnFilters): Observable<any> {
    return this.getAllByPagination(filters, 'getAllByPagination');
  }

  getOrderReturnById(orderReturnId: string): Observable<OrderReturn> {
    return this.getById(orderReturnId);
  }
}
