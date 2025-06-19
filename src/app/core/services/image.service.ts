import { inject, Injectable, NgZone } from '@angular/core';
import { BaseService } from './base.service';
import { Product, ProductFilters } from '../models/product.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ImageDoc, ImageFilters } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class ImageService extends BaseService<ImageDoc> {
  private router = inject(Router);
  private headers: HttpHeaders | null = null;
  constructor(ngZone: NgZone, private authService: AuthService) {
    super(inject(HttpClient), 'ecs-inventory-admin/api/public/images', ngZone);
    // this.headers = new HttpHeaders({
    //   Authorization: 'Bearer ' + localStorage.getItem('userToken'),
    // });
  }

  getAllImagesByPagination(imageFilters: ImageFilters): Observable<any> {
    return this.getAllByPagination(imageFilters, 'getAllImagesByPagination');
  }

  getImageById(id: string): Observable<ImageDoc> {
    return this.getByPathParam(id, 'getByImageId');
  }

  getImageByName(imageName: string): Observable<ImageDoc> {
    return this.getByPathParam(imageName, 'getByImageName');
  }

  addImage(image: ImageDoc): Observable<ImageDoc> {
    return this.post(image, '');
  }

  updateImage(image: ImageDoc): Observable<ImageDoc> {
    return this.update(image);
  }

  deleteImage(imageId: string): Observable<string> {
    return this.deleteWithStringResponse(imageId);
  }
}
