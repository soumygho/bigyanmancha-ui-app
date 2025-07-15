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

  form: any;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  handleLogin() {
    this.authApi.authenticateUser({body: this.form.value}).subscribe(resp => {
      console.trace(resp);
      //set the token into local storage
      //need to call auth api and mutate global state
      this.globalStateManagerService.mutateLoggedInUserState(resp, true);
      console.trace(this.globalStateManagerService.getLoggedInUserState());
      this.router.navigate(['/admin/landing-page']);
    });
  }
}
