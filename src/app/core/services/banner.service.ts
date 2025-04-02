import { Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Banner } from '../models/banner.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BannerService extends BaseService<Banner> {
  constructor(http: HttpClient, ngZone: NgZone) {
    super(http, 'banners', ngZone);
  }
}
