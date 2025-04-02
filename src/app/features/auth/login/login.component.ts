import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  private router = inject(Router);

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      adminUsername: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.authService.loginUser(this.loginForm.value).subscribe({
        next: (user) => {
          console.log('User after login: ', user?.adminRole);
          if (user?.adminRole?.roleName === 'admin') {
            switch (user?.adminRole?.subRole) {
              case 'inventory':
                this.router.navigate(['/inventory']);
                break;
              case 'marketing':
                this.router.navigate(['/marketing']);
                break;
              case 'logistics':
                this.router.navigate(['/logistics']);
                break;
              default:
                console.warn(
                  'Unknown admin sub-role:',
                  user?.adminRole?.subRole
                );
                this.router.navigate(['/error-page']);
                break;
            }
          } else {
            console.log('Invalid Role, redirecting to login');
            this.router.navigate(['/error-page']);
          }
        },
        error: (err) => {
          console.log('Error : ', err);
          this.errorMessage = 'Invalid username or password!';
        },
      });
    }
  }
}
