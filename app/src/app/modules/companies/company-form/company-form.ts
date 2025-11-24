import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CompanyService } from '../company.service';
import { ToastService } from '../../../shared/components/toast/toast.services';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './company-form.html',
  styleUrls: ['./company-form.scss'],
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);

  form: FormGroup;
  companyId?: string;
  isEditMode = false;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correo_contacto: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.companyId = history.state.companyId;
    this.isEditMode = !!this.companyId;

    if (this.isEditMode && this.companyId) {
      this.loadData(this.companyId);
    }
  }

  loadData(id: string) {
    this.loading = true;
    this.companyService.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error cargando empresa');
        this.goBack();
      },
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    const data = this.form.value;

    if (this.isEditMode && this.companyId) {
      this.companyService.update(this.companyId, data).subscribe({
        next: () => {
          this.toast.success('Empresa actualizada');
          this.goBack();
        },
        error: () => {
          this.toast.error('Error al actualizar');
          this.loading = false;
        },
      });
    } else {
      this.companyService.create(data).subscribe({
        next: () => {
          this.toast.success('Empresa creada');
          this.goBack();
        },
        error: () => {
          this.toast.error('Error al crear');
          this.loading = false;
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/companies']);
  }
}
