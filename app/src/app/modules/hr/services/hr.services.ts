import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Incapacity } from '../../../core/models/incapacity.model';
import { UserResponse } from '../../auth/interfaces/user-response.interface';
import { UsersListResponse } from '../../../core/models/user.model';
import { AuthService } from '../../auth/auth.services';

@Injectable({
  providedIn: 'root',
})
export class HrService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:3005';

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllIncapacities(filters: any): Observable<Incapacity[]> {
    return this.http.get<Incapacity[]>(
      `${this.baseUrl}/incapacidades/admin/list`,
      {
        params: filters,
        headers: this.getHeaders(),
      },
    );
  }

  updateStatus(
    id: string,
    estado: string,
    motivoRechazo?: string,
  ): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/incapacidades/${id}/estado`,
      {
        estado,
        observacion: motivoRechazo,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http
      .get<UsersListResponse>(`${this.baseUrl}/users`, {
        headers: this.getHeaders(),
      })
      .pipe(map((response) => response.users));
  }
}
