import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Subscription } from 'rxjs';
import { Admin } from '../../../core/models/admin.model';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-logistics-admin',
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
  templateUrl: './logistics-admin.component.html',
  styleUrl: './logistics-admin.component.css',
})
export class LogisticsAdminComponent implements OnInit, OnDestroy {
  isSidenavOpen = true;
  currentPageTitle: string = 'Dashboard';
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  adminData: Admin | null = null;
  currentRoute: string = '';
  faUser = faUser;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

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
          if (this.router.url === '/logistics') {
            return 'Dashboard';
          }
          return lastSegment
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        })
      )
      .subscribe((title: string) => {
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

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
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

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
