/**
 * Estadistica: representa estadísticas calculadas sobre un conjunto de incapacidades.
 * En Supabase, se mapea a la tabla `estadisticas`.
 */
export interface Estadistica {
  id: string; // UUID
  start_date: Date;
  end_date: Date;
  total_incapacidades: number;
  total_pendiente_pago: number; // Decimal
  tiempo_promedio_aprobacion: number; // Float (días o horas)
  ubicacion_grafico?: string; // Path a gráfico generado (imagen)
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - generarDesde(datos): void
 * - calcularTiemposPromedio(): number
 * - exportarGrafico(formato: string): File
 */
