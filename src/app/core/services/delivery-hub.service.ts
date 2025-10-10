import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeliveryHub,
  DeliveryHubFilters,
  DeliveryHubRequest,
} from '../models/delivery.model';

@Injectable({
  providedIn: 'root',
})
export class DeliveryHubService extends BaseService<DeliveryHub> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-logistics/api/deliveryHubs', ngZone);
  }

  getAllDeliveryHubsBypagination(filters: DeliveryHubFilters): Observable<any> {
    return this.getAllByPagination(filters, 'getAllByPagination');
  }

  getDeliveryHubById(hubId: number): Observable<DeliveryHub> {
    return this.getById(hubId);
  }

  addDeliveryHub(data: DeliveryHubRequest | any): Observable<DeliveryHub> {
    return this.post(data, '');
  }

  updateDeliveryHub(data: DeliveryHubRequest | any): Observable<DeliveryHub> {
    return this.update(data);
  }

  deleteDeliveryHub(hubId: number): Observable<boolean | void> {
    return this.delete(hubId);
  }
}
