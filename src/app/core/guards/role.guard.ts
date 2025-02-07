import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getUser();
    const expectedRole = route.data['role'];

    if (!user || user.role !== expectedRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
