import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Admin } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user: Admin | null = this.authService.getUser();
    const expectedRole = route.data['role'];
    const expectedSubRoles: string[] = route.data['subRoles'];

    if (
      !user ||
      user.adminRole?.roleName !== expectedRole ||
      !expectedSubRoles.includes(user.adminRole?.subRole || 'null')
    ) {
      this.router.navigate(['/access-denied']);
      return false;
    }
    return true;
  }
}
