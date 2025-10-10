import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeliveryAgent,
  DeliveryAgentFilters,
  DeliveryHub,
  DeliveryHubFilters,
} from '../models/delivery.model';

@Injectable({
  providedIn: 'root',
})
export class DeliveryAgentService extends BaseService<DeliveryAgent> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-logistics/api/deliveryAgents', ngZone);
  }

  getAllDeliveryAgentsBypagination(
    filters: DeliveryAgentFilters
  ): Observable<any> {
    return this.getAllByPagination(filters, 'getAllByPagination');
  }

  getDeliveryAgentById(agentId: number): Observable<DeliveryAgent> {
    return this.getById(agentId);
  }

  addDeliveryAgent(data: DeliveryAgent): Observable<DeliveryAgent> {
    return this.post(data, '');
  }

  updateDeliveryAgent(data: DeliveryAgent): Observable<DeliveryAgent> {
    return this.update(data);
  }

  deleteDeliveryAgent(agentId: number): Observable<void | boolean> {
    return this.delete(agentId);
  }
}
