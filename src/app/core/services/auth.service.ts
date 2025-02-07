import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();
  private router = inject(Router);

  login(username: string, password: string): void {
    // Mock API call - Replace with real API call
    const mockUser: User = {
      id: 1,
      username,
      role: 'inventory-admin', // Set based on user type
      token: 'mock-jwt-token',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    this.userSubject.next(mockUser);
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}
