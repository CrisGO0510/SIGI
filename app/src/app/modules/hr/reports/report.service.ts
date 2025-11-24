import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.services';
import { DashboardResponse } from '../../../core/models/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3005';

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${this.baseUrl}/reports/dashboard`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  sendReportEmail(
    empresaId: string,
    fechaInicio: string,
    fechaFin: string,
  ): Observable<any> {
    const body = {
      empresa_id: empresaId,
      fechaInicio,
      fechaFin,
    };
    return this.http.post(`${this.baseUrl}/email/reporte-empresa`, body, {
      headers: this.getHeaders(),
    });
  }

  downloadReport(
    empresaId: string,
    formato: 'PDF' | 'CSV',
    fechaInicio: string,
    fechaFin: string,
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('empresa_id', empresaId)
      .set('formato', formato)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get(`${this.baseUrl}/email/descargar-reporte`, {
      headers: this.getHeaders(),
      params: params,
      responseType: 'blob',
    });
  }
}
