import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject, Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { map, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environment';
import * as CryptoJS from 'crypto-js';
import { ProductFilters } from '../models/product.model';
import { ImageFilters } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class BaseService<T> {
  private baseUrl = 'http://localhost:8080';
  private token: string | null = null;
  private authValue: string = '';
  @Inject(PLATFORM_ID) private baseClassPlatformId: Object =
    inject(PLATFORM_ID);

  constructor(
    protected http: HttpClient,
    @Inject(String) private endpoint: string,
    private ngZone: NgZone
  ) {
    if (isPlatformBrowser(this.baseClassPlatformId)) {
      this.ngZone.runOutsideAngular(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          let rawToken = localStorage.getItem('userToken');
          this.token = this.decryptData(rawToken ? rawToken : '');
          this.authValue = 'Bearer ' + this.token;
        } else {
          console.warn('localStorage is not available.');
        }
      });
    }
  }

  decryptData(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        environment.secretValue
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }

  private mergeHeaders(headers?: HttpHeaders): HttpHeaders {
    const predefinedHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authValue,
    });
    if (!headers) {
      return predefinedHeaders;
    }
    return predefinedHeaders.keys().reduce((mergedHeaders, key) => {
      return mergedHeaders.has(key)
        ? mergedHeaders
        : mergedHeaders.set(key, predefinedHeaders.get(key) as string);
    }, headers);
  }

  getAll(headers?: HttpHeaders): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}/`, {
      headers: this.mergeHeaders(headers),
    });
  }

  getAllByPagination(
    filters: ProductFilters | ImageFilters,
    resource: string,
    headers?: HttpHeaders
  ): Observable<any> {
    var params: HttpParams;
    if (
      typeof filters === 'object' &&
      filters !== null &&
      'currentPage' in filters &&
      'offset' in filters
    ) {
      params = new HttpParams()
        .set('currentPage', (filters as ProductFilters).currentPage)
        .set('offset', (filters as ProductFilters).offset)
        .set('categoryId', (filters as ProductFilters).categoryId || '')
        .set('subCategoryId', (filters as ProductFilters).subCategoryId || '')
        .set('brandId', (filters as ProductFilters).brandId || '')
        .set('searchValue', (filters as ProductFilters).searchValue || '');
    } else {
      params = new HttpParams()
        .set('currentPage', (filters as ImageFilters).currentPage)
        .set('offset', (filters as ImageFilters).offset)
        .set('searchValue', (filters as ImageFilters).searchValue || '');
    }

    return this.http.get<Object>(
      `${this.baseUrl}/${this.endpoint}/${resource}`,
      {
        headers: this.mergeHeaders(headers),
        params: params,
      }
    );
  }

  getById(id: number, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`, {
      headers: this.mergeHeaders(headers),
    });
  }

  getByPathParam(
    pathParam: number | string,
    path: string,
    headers?: HttpHeaders
  ): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/${this.endpoint}/${path}/${pathParam}`,
      {
        headers: this.mergeHeaders(headers),
      }
    );
  }

  getByUsername(
    resource: string,
    username: string,
    headers?: HttpHeaders
  ): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/${this.endpoint}/${resource}/${username}`,
      { headers: this.mergeHeaders(headers) }
    );
  }

  getAllByPath(
    resource: string,
    id: number,
    headers?: HttpHeaders
  ): Observable<[T]> {
    return this.http.get<[T]>(
      `${this.baseUrl}/${this.endpoint}/${resource}/${id}`,
      {
        headers: this.mergeHeaders(headers),
      }
    );
  }

  login(data: T, resource: string): Observable<string> {
    var apiURL =
      !!resource && resource != ''
        ? `${this.baseUrl}/${this.endpoint}/${resource}`
        : `${this.baseUrl}/${this.endpoint}`;
    return this.http.post(apiURL, data, {
      responseType: 'text',
    });
  }

  post(data: T | any, resource: string, headers?: HttpHeaders): Observable<T> {
    var apiURL =
      !!resource && resource != ''
        ? `${this.baseUrl}/${this.endpoint}/${resource}`
        : `${this.baseUrl}/${this.endpoint}`;
    return this.http.post<T>(apiURL, data, {
      headers: this.mergeHeaders(headers),
    });
  }

  postWithBooleanResponse(
    data1: string,
    data2: string,
    resource: string,
    headers?: HttpHeaders
  ): Observable<string> {
    console.log(this.mergeHeaders(headers));
    return this.http.post(
      `${this.baseUrl}/${this.endpoint}/${resource}`,
      {
        imageName: data1,
        imageId: data2,
      },
      {
        headers: this.mergeHeaders(headers),
        responseType: 'text',
      }
    );
    // .pipe(
    //   map((response: string) => {
    //     return response === 'true';
    //   })
    // );
  }

  update(data: T, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}`, data, {
      headers: this.mergeHeaders(headers),
    });
  }

  updateAll(data: T[] | any[], headers?: HttpHeaders): Observable<T[]> {
    return this.http.put<T[]>(`${this.baseUrl}/${this.endpoint}`, data, {
      headers: this.mergeHeaders(headers),
    });
  }

  patch(
    id: string | number,
    fieldValue: string,
    headers?: HttpHeaders
  ): Observable<T> {
    return this.http.patch<T>(
      `${this.baseUrl}/${this.endpoint}/${id}?imageName=${fieldValue}`,
      {
        headers: this.mergeHeaders(headers),
      }
    );
  }

  delete(id: number, headers?: HttpHeaders): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`, {
      headers: this.mergeHeaders(headers),
    });
  }

  deleteWithStringResponse(
    id: number | string,
    headers?: HttpHeaders
  ): Observable<HttpResponse<string>> {
    console.log(this.mergeHeaders(headers));
    return this.http.delete<string>(`${this.baseUrl}/${this.endpoint}/${id}`, {
      headers: this.mergeHeaders(headers),
      responseType: 'text' as 'json',
      observe: 'response',
    });
  }
}
