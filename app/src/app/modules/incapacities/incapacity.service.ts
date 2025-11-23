import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.services';
import { Incapacity } from '../../core/models/incapacity.model';

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
}
