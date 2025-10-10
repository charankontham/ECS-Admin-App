import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { OrderItem } from '../models/order.model';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderItemService extends BaseService<OrderItem> {
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-order/api/order', ngZone);
  }

  getOrderItemByOrderItemId(orderItemId: number): Observable<OrderItem> {
    return this.getById(orderItemId);
  }

  updateOrderItem(orderItem: OrderItem): Observable<OrderItem> {
    return this.update(orderItem);
  }
}
