import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IncapacityService } from '../incapacity.service';
import { ToastService } from '../../../../shared/components/toast/toast.services';
import { Incapacity } from '../../../../core/models/incapacity.model';

@Component({
  selector: 'app-incapacity-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './incapacity-form.html',
  styleUrl: './incapacity-form.scss',
})
export class IncapacityForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private incapacityService = inject(IncapacityService);
  private toast = inject(ToastService);

  form: FormGroup;
  incapacityId?: string;
  isEditMode = false;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      motivo: ['', Validators.required],
      monto_solicitado: [0, [Validators.required, Validators.min(1)]],
      observaciones: [''],
    });
  }

  ngOnInit() {
    this.incapacityId = history.state.incapacityId;

    this.isEditMode = !!this.incapacityId;

    if (this.isEditMode && this.incapacityId) {
      this.loadDataForEdit(this.incapacityId);
    }
  }

  loadDataForEdit(id: string) {
    this.loading = true;

    this.incapacityService.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin,
          motivo: data.motivo,
          monto_solicitado: data.monto_solicitado,
          observaciones: data.observaciones,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos', err);

        this.toast.error('No se pudo cargar la información de la incapacidad');

        this.router.navigate(['/incapacities']);
      },
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    const formData = this.form.value;

    if (this.isEditMode && this.incapacityId) {
      this.incapacityService.update(this.incapacityId, formData).subscribe({
        next: () => {
          this.toast.success('Incapacidad actualizada correctamente');
          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error al actualizar. Intenta nuevamente.');
          this.loading = false;
        },
      });
    } else {
      const createPayload: Partial<Incapacity> = {
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        motivo: formData.motivo,
        monto_solicitado: formData.monto_solicitado,
        observaciones: formData.observaciones,
      };

      this.incapacityService.create(createPayload).subscribe({
        next: () => {
          this.toast.success('Incapacidad creada correctamente');
          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error al crear. Intenta nuevamente.');
          this.loading = false;
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/incapacities']);
  }
}
