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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocumentService } from '../document.services';
import { ToastService } from '../../../../shared/components/toast/toast.services';

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './uploader.html',
  styleUrl: './uploader.scss',
})
export class Uploader implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);

  incapacityId?: string;
  form: FormGroup;
  selectedFile: File | null = null;
  uploading = false;

  documentTypes = [
    { value: 'incapacidad_medica', label: 'Certificado Médico' },
    { value: 'historia_clinica', label: 'Historia Clínica' },
    { value: 'examenes', label: 'Resultados de Exámenes' },
    { value: 'otro', label: 'Otro Soporte' },
  ];

  constructor() {
    this.form = this.fb.group({
      tipoDocumento: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {
    this.incapacityId = history.state.incapacityId;

    if (!this.incapacityId) {
      this.toast.error('Error: No se identificó la incapacidad.');
      this.goBack();
      return;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.toast.warning('El archivo es demasiado pesado (Máx 5MB)');
        return;
      }
      this.selectedFile = file;
    }
  }

  upload() {
    if (!this.selectedFile || this.form.invalid || !this.incapacityId) return;

    this.uploading = true;
    const { tipoDocumento, descripcion } = this.form.value;

    this.documentService
      .uploadDocument(
        this.selectedFile,
        this.incapacityId,
        tipoDocumento,
        descripcion,
      )
      .subscribe({
        next: () => {
          this.uploading = false;
          this.toast.success('Documento subido correctamente');

          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.uploading = false;
          this.toast.error('Error al subir el archivo');
        },
      });
  }

  goBack() {
    this.router.navigate(['/incapacities']);
  }
}
