import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.services';
import { Company } from '../../core/models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:3005/empresas';

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  create(data: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, data, {
      headers: this.getHeaders(),
    });
  }

  update(id: string, data: Partial<Company>): Observable<Company> {
    return this.http.patch<Company>(`${this.baseUrl}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
