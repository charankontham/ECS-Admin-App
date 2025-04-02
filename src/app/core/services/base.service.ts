import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environment';
import * as CryptoJS from 'crypto-js';
import { ProductFilters } from '../models/product.model';

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

  private predefinedHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: this.authValue,
  });

  private mergeHeaders(headers?: HttpHeaders): HttpHeaders {
    if (!headers) {
      return this.predefinedHeaders;
    }
    return this.predefinedHeaders.keys().reduce((mergedHeaders, key) => {
      return mergedHeaders.has(key)
        ? mergedHeaders
        : mergedHeaders.set(key, this.predefinedHeaders.get(key) as string);
    }, headers);
  }

  getAll(headers?: HttpHeaders): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}/`, {
      headers: this.mergeHeaders(headers),
    });
  }

  getAllByPagination(
    filters: ProductFilters,
    resource: string,
    headers?: HttpHeaders
  ): Observable<any> {
    let params = new HttpParams()
      .set('currentPage', filters.currentPage)
      .set('offset', filters.offset)
      .set('categoryId', filters.categoryId || '')
      .set('subCategoryId', filters.subCategoryId || '')
      .set('brandId', filters.brandId || '')
      .set('searchValue', filters.searchValue || '');

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

  post(data: T, resource: string, headers?: HttpHeaders): Observable<T> {
    var apiURL =
      !!resource && resource != ''
        ? `${this.baseUrl}/${this.endpoint}/${resource}`
        : `${this.baseUrl}/${this.endpoint}`;
    return this.http.post<T>(apiURL, data, {
      headers: this.mergeHeaders(headers),
    });
  }

  update(data: T, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}`, data, {
      headers: this.mergeHeaders(headers),
    });
  }

  updateAll(data: T[], headers?: HttpHeaders): Observable<T[]> {
    return this.http.put<T[]>(`${this.baseUrl}/${this.endpoint}`, data, {
      headers: this.mergeHeaders(headers),
    });
  }

  delete(id: number, headers?: HttpHeaders): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`, {
      headers: this.mergeHeaders(headers),
    });
  }

  deleteWithStringResponse(
    id: number,
    headers?: HttpHeaders
  ): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${this.endpoint}/${id}`, {
      headers: this.mergeHeaders(headers),
    });
  }
}
