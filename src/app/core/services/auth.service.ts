import { Inject, Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Admin } from '../models/admin.model';
import { BaseService } from './base.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environment';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
  sub?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService<Admin> {
  private userSubject = new BehaviorSubject<Admin | null>(null);
  user$: Observable<Admin | null> = this.userSubject.asObservable();
  private router = inject(Router);
  private platformId: Object = inject(PLATFORM_ID);

  constructor(ngZone: NgZone) {
    super(inject(HttpClient), 'ecs-inventory-admin/api/admin', ngZone);
    this.loadUserFromStorage();
  }

  encryptData(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      environment.secretValue
    ).toString();
  }

  override decryptData(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        environment.secretValue
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.log('Error decrypting data:', error);
      return null;
    }
  }

  loadUserFromStorage() {
    let encryptedUserData;
    if (isPlatformBrowser(this.platformId)) {
      encryptedUserData = localStorage.getItem('userSubject');
    }
    if (!!encryptedUserData) {
      const decryptedUser = this.decryptData(encryptedUserData);
      if (!!decryptedUser) {
        this.userSubject.next(JSON.parse(decryptedUser));
      } else {
        this.userSubject.next(null);
      }
    }
  }

  loginUser(login: {
    adminUsername: string;
    adminPassword: string;
  }): Observable<any> {
    const requestBody: Admin = {
      adminUsername: login.adminUsername,
      adminPassword: login.adminPassword,
    };
    console.log('Login attempt for user:', login.adminUsername);

    return this.login(requestBody, 'login').pipe(
      switchMap((response) => {
        var headers: HttpHeaders = new HttpHeaders({
          Authorization: 'Bearer ' + response,
        });
        localStorage.setItem('userToken', this.encryptData(response));
        return this.getByUsername(
          'getByUsername',
          login.adminUsername,
          headers
        ).pipe(
          tap((adminResponse) => {
            this.userSubject.next(adminResponse);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem(
                'userSubject',
                this.encryptData(JSON.stringify(adminResponse))
              );
            }
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('Wrong credentials!');
        }
        return throwError(() => new Error(error.message));
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userSubject');
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  getUser(): Admin | null {
    return this.userSubject.value;
  }

  getUserToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const userToken = localStorage.getItem('userToken');
      return userToken ? this.decryptData(userToken) : null;
    } else {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    const token = this.getUserToken();
    if (!token) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userSubject');
      }
      return true;
    }
    try {
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp ? currentTime >= decodedToken.exp : false;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userSubject');
      }
      return true;
    }
  }
}
