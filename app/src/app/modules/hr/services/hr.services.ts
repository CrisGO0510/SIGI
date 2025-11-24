import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incapacity } from '../../../core/models/incapacity.model';

export interface HrDashboardStats {
  totalPendientes: number;
  promedioAprobacionHoras: number;
  documentosPorValidar: number;
  incapacidadesPorMes: { mes: string; cantidad: number }[];
  estadosGlobales: { estado: string; cantidad: number }[];
  rankingIncidencias: { motivo: string; cantidad: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class HrService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3005';

  getDashboardStats(): Observable<HrDashboardStats> {
    return this.http.get<HrDashboardStats>(
      `${this.baseUrl}/analytics/rrhh/dashboard`,
    );
  }

  getAllIncapacities(filters: any): Observable<Incapacity[]> {
    return this.http.get<Incapacity[]>(
      `${this.baseUrl}/incapacidades/admin/list`,
      { params: filters },
    );
  }

  updateStatus(
    id: string,
    estado: string,
    motivoRechazo?: string,
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/incapacidades/${id}/estado`, {
      estado,
      observacion: motivoRechazo,
    });
  }
}
