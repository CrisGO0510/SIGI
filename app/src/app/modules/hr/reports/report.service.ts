import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.services';
import { DashboardResponse } from '../../../core/models/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3005/reports/dashboard';

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }
}
