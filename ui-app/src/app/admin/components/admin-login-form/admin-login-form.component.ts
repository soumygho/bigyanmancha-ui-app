import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StateManagerService } from '../../services/state-manager.service';
import { AuthApiService } from '../../../api/services';
import { ApiModule } from '../../../api/api.module';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { jwtDecode } from 'jwt-decode';
import { AdminAuthService } from '../../services/admin-auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-login-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ApiModule,
    ReactiveFormsModule,
    MatCommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './admin-login-form.component.html',
  styleUrl: './admin-login-form.component.css',
})
export class AdminLoginFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly globalStateManagerService = inject(StateManagerService);
  private readonly authApi = inject(AuthApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AdminAuthService);
  private readonly notficationService = inject(NotificationService);

  form: any;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/landing-page']);
    }
    this.form = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  handleLogin() {
    this.authApi.authenticateUser({ body: this.form.value }).subscribe({
      next: (resp) => {
        this.globalStateManagerService.mutateLoggedInUserState(resp, true);
        this.authService.login(resp?.jwt!);
        this.router.navigate(['/admin/landing-page']);
      },
      error: (err) => {
        this.notficationService.show('Login failed, Please try again with valid credentials!');
      }
    });
  }
}
