import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import {
  Order,
  OrderFilters,
  OrderItemFilters,
  OrderRequest,
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
export class OrderTrackingService extends BaseService<OrderTracking> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-logistics/api/orderTracking', ngZone);
  }

  getAllOrderTrackingsBypagination(
    filters: OrderTrackingFilters
  ): Observable<any> {
    return this.getAllByPagination(filters, 'getAllByPagination');
  }

  getOrderTrackingById(orderTrackingId: string): Observable<OrderTracking> {
    return this.getById(orderTrackingId);
  }

  updateOrderTracking(
    orderTrackingRequest: OrderTrackingRequest
  ): Observable<OrderTracking> {
    return this.update(orderTrackingRequest);
  }

  updateOrderTrackingStatus(orderTrackingId: number, statusId: number) {
    return this.patchUpdate(
      `updateStatus/${orderTrackingId}?statudId=${statusId}`
    );
  }
}
