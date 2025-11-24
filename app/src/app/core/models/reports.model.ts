export interface ReportStats {
  totalIncapacidades: number;
  pendientesRevision: number;
  aprobadas: number;
  rechazadas: number;
  pagadas: number;
  montoTotalSolicitado: number;
  montoTotalAprobado: number;
  promediosDias: number;
  porEstado: { [key: string]: number };
  porMes: { mes: string; cantidad: number }[];
  motivosFrecuentes: { motivo: string; cantidad: number }[];
}

export interface ReportTrends {
  porMes: { mes: string; cantidad: number }[];
  tendencia: string;
  promedioMensual: number;
  pendiente: number | null;
}

export interface ReportAlerts {
  pendientesRevision: number;
  tasaAprobacion: number;
}

export interface ReportKpis {
  totalIncapacidades: number;
  montoTotal: number;
  promediosDias: number;
  tasaAprobacion: number;
}

export interface DashboardResponse {
  estadisticas: ReportStats;
  tendencias: ReportTrends;
  alertas: ReportAlerts;
  kpis: ReportKpis;
}
