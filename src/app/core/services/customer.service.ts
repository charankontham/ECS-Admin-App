import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerDto } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService extends BaseService<CustomerDto> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-customer/api/customer', ngZone);
  }

  getCustomerById(customerId: number): Observable<CustomerDto> {
    return this.getById(customerId);
  }
}
