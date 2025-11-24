import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentFile } from '../../../core/models/document.model';
import { AuthService } from '../../auth/auth.services';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3005/documents';

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  uploadDocument(
    file: File,
    incapacityId: string,
    tipoDocumento: string,
    descripcion: string,
  ): Observable<DocumentFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('incapacidadId', incapacityId);
    formData.append('tipoDocumento', tipoDocumento);
    formData.append('descripcion', descripcion);

    return this.http.post<DocumentFile>(`${this.baseUrl}/upload`, formData, {
      headers: this.getHeaders(),
    });
  }

  getDocumentsByIncapacity(incapacityId: string): Observable<DocumentFile[]> {
    return this.http.get<DocumentFile[]>(
      `${this.baseUrl}/incapacidad/${incapacityId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  validateDocument(docId: string) {
    return this.http.patch<DocumentFile>(
      `${this.baseUrl}/${docId}/validacion`,
      {
        validado: true,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${documentId}`, {
      headers: this.getHeaders(),
    });
  }
}
