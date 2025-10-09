import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Subscription } from 'rxjs';
import { Admin } from '../../../core/models/admin.model';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-logistics-admin',
  imports: [
    RouterModule,
    FontAwesomeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './logistics-admin.component.html',
  styleUrl: './logistics-admin.component.css',
})
export class LogisticsAdminComponent implements OnInit, OnDestroy {
  currentPageTitle: string = 'Dashboard';
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  adminData: Admin | null = null;
  currentRoute: string = '';
  private router = inject(Router);
  private authService = inject(AuthService);
  faUser = faUser;
  private dialog = inject(MatDialog);

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
