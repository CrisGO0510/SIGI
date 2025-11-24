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
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { IncapacityService } from '../incapacity.service';
import { ToastService } from '../../../../shared/components/toast/toast.services';
import { IncapacityStatusEnum } from '../../../../core/models/incapacity.model';

@Component({
  selector: 'app-hr-incapacity-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './hr-incapacity-form.html',
  styleUrl: './hr-incapacity-form.scss',
})
export class HrIncapacityForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private incapacityService = inject(IncapacityService);
  private toast = inject(ToastService);

  readOnlyForm: FormGroup;

  actionForm: FormGroup;

  incapacityId?: string;
  loading = false;

  availableStatuses = Object.values(IncapacityStatusEnum);

  constructor() {
    this.readOnlyForm = this.fb.group({
      fecha_inicio: [{ value: '', disabled: true }],
      fecha_fin: [{ value: '', disabled: true }],
      motivo: [{ value: '', disabled: true }],
      monto_solicitado: [{ value: '', disabled: true }],
    });

    this.actionForm = this.fb.group({
      estado: ['', Validators.required],
      observaciones: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.incapacityId = history.state.incapacityId;

    if (this.incapacityId) {
      this.loadData(this.incapacityId);
    } else {
      this.toast.error('No se seleccionó ninguna incapacidad');
      this.goBack();
    }
  }

  loadData(id: string) {
    this.loading = true;

    this.incapacityService.getById(id).subscribe({
      next: (data) => {
        this.readOnlyForm.patchValue({
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin,
          motivo: data.motivo,
          monto_solicitado: this.formatNumber(data.monto_solicitado),
        });

        this.actionForm.patchValue({
          estado: data.estado,
          observaciones: data.observaciones,
        });

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error cargando la información');
        this.goBack();
      },
    });
  }

  updateStatus() {
    if (this.actionForm.invalid || !this.incapacityId) return;

    this.loading = true;
    const { estado, observaciones } = this.actionForm.value;

    this.incapacityService
      .chageStatus(this.incapacityId, estado, observaciones)
      .subscribe({
        next: () => {
          this.toast.success(`Estado actualizado a ${estado}`);
          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error al actualizar el estado');
          this.loading = false;
        },
      });
  }

  goBack() {
    this.router.navigate(['/hr/incapacities']);
  }

  private formatNumber(num: number): string {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
  }
}
