import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Incapacity,
  IncapacityStatusEnum,
} from '../../../core/models/incapacity.model';
import { AuthService } from '../../auth/auth.services';

@Injectable({
  providedIn: 'root',
})
export class IncapacityService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3005/incapacidades';

  getMyIncapacities(): Observable<Incapacity[]> {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    if (!userId) {
      throw new Error('No se pudo identificar el usuario logueado');
    }

    const token = this.authService.token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Incapacity[]>(`${this.baseUrl}/usuario/${userId}`, {
      headers,
    });
  }

  getAllIncapacities(userId?: string): Observable<Incapacity[]> {
    const token = this.authService.token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    if (userId) {
      return this.http.get<Incapacity[]>(`${this.baseUrl}/usuario/${userId}`, {
        headers,
      });
    }

    return this.http.get<Incapacity[]>(`${this.baseUrl}`, {
      headers,
    });
  }

  getById(id: string): Observable<Incapacity> {
    const token = this.authService.token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Incapacity>(`${this.baseUrl}/${id}`, {
      headers,
    });
  }

  create(incapacity: Partial<Incapacity>): Observable<Incapacity> {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    if (!userId) {
      throw new Error('No se pudo identificar el usuario logueado');
    }

    const token = this.authService.token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<Incapacity>(
      this.baseUrl,
      { ...incapacity, usuario_id: userId },
      { headers },
    );
  }

  update(id: string, incapacity: Partial<Incapacity>): Observable<Incapacity> {
    const token = this.authService.token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch<Incapacity>(`${this.baseUrl}/${id}`, incapacity, {
      headers,
    });
  }

  chageStatus(
    id: string,
    status: IncapacityStatusEnum,
    observations: string,
  ): Observable<Incapacity> {
    const token = this.authService.token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch<Incapacity>(
      `${this.baseUrl}/${id}`,
      { estado: status, observaciones: observations },
      {
        headers,
      },
    );
  }
}
