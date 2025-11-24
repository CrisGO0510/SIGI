import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { DocumentService } from '../../employment/documents/document.services';
import { Incapacity } from '../../../core/models/incapacity.model';
import { DocumentFile } from '../../../core/models/document.model';
import { ToastService } from '../../../shared/components/toast/toast.services';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './hr-documents.html',
  styleUrl: './hr-documents.scss',
})
export class HrDocumentsComponent implements OnInit {
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);

  incapacity?: Incapacity;
  documents: DocumentFile[] = [];
  loadingDocs = false;

  displayedColumns: string[] = ['nombre', 'info', 'validacion', 'acciones'];

  ngOnInit() {
    this.incapacity = history.state.incapacity;

    if (!this.incapacity) {
      this.router.navigate(['/incapacities']);
      return;
    }

    this.loadDocuments(this.incapacity.id);
  }

  loadDocuments(id: string) {
    this.loadingDocs = true;
    this.documentService.getDocumentsByIncapacity(id).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loadingDocs = false;
      },
      error: (err) => {
        console.error('Error cargando documentos', err);
        this.loadingDocs = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/incapacities']);
  }

  openDocument(url: string) {
    window.open(url, '_blank');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(format: string): string {
    const fmt = format.toLowerCase();
    if (fmt.includes('pdf')) return 'picture_as_pdf';
    if (fmt.includes('jpg') || fmt.includes('png') || fmt.includes('jpeg'))
      return 'image';
    return 'description';
  }

  getIconColor(format: string): string {
    const fmt = format.toLowerCase();
    if (fmt.includes('pdf')) return '#e53935';
    if (fmt.includes('image')) return '#43a047';
    return '#757575';
  }

  deleteDocument(docId: string) {
    this.documentService.deleteDocument(docId).subscribe({
      next: () => {
        this.documents = this.documents.filter((doc) => doc.id !== docId);
        this.toast.success('Documento eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando documento', err);
        this.toast.error('Error al eliminar el documento');
      },
    });
  }

  validateDocument(docId: string): void {
    this.documentService.validateDocument(docId).subscribe({
      next: () => {
        this.toast.success('Documento validado correctamente');
        this.documents = this.documents.map((doc) =>
          doc.id === docId ? { ...doc, validado: true } : doc,
        );
      },
      error: (err) => {
        console.error('Error validando documento', err);
        this.toast.error('Error al validar el documento');
      },
    });
  }
}
