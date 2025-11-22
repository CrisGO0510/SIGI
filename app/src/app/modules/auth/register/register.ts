import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.services';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { UserRoleEnum } from '../interfaces/user-role.enum';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class Register {
  fb = inject(FormBuilder);
  router = inject(Router);
  auth = inject(AuthService);

  loading = false;
  errorMsg = '';
  roles = Object.values(UserRoleEnum);

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rol: [UserRoleEnum.employment, Validators.required],
    empresa_id: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    const registerData = this.form.getRawValue() as RegisterRequest;

    this.auth.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'Error al registrar usuario';
      },
    });
  }
}
