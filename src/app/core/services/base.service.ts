import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseService<T> {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  constructor(private endpoint: string) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}`);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  create(data: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, data);
  }

  update(id: number, data: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }
}
