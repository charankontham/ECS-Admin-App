import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressDto } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService extends BaseService<AddressDto> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-customer/api/address', ngZone);
  }

  getAddressById(hubId: number): Observable<AddressDto> {
    return this.getById(hubId);
  }

  addAddress(data: AddressDto | any): Observable<AddressDto> {
    return this.post(data, '');
  }

  updateAddress(data: AddressDto | any): Observable<AddressDto> {
    return this.update(data);
  }

  deleteAddress(addressId: number): Observable<HttpResponse<string>> {
    return this.deleteWithStringResponse(addressId);
  }
}
