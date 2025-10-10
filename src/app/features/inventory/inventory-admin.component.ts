import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Admin } from '../../core/models/admin.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-inventory-admin',
  standalone: true,
  imports: [
    RouterModule,
    FontAwesomeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatDialogModule,
  ],
  templateUrl: './inventory-admin.component.html',
  styleUrl: './inventory-admin.component.css',
})
export class InventoryAdminComponent implements OnInit, OnDestroy {
  currentPageTitle: string = 'Dashboard';
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  adminData: Admin | null = null;
  currentRoute: string = '';
  private router = inject(Router);
  private authService = inject(AuthService);
  faUser = faUser;
  dialog = inject(MatDialog);
  isSidenavOpen = true;

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.router.routerState.snapshot.root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          const urlSegments = this.router.url.split('/');
          const lastSegment =
            urlSegments.length <= 3
              ? urlSegments[urlSegments.length - 1]
              : urlSegments[2];
          if (this.router.url === '/inventory') {
            return 'Dashboard';
          }
          return lastSegment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        })
      )
      .subscribe((title) => {
        this.currentPageTitle = title;
      });
    this.userSubscription = this.authService.user$.subscribe(
      (user: Admin | null) => {
        if (user) {
          this.adminData = user;
        }
      }
    );
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        confirmText: 'Logout',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
