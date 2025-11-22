/**
 * Enums para el dominio SIGI
 */

/**
 * Estados del ciclo de vida de una incapacidad
 * 
 * Flujo típico:
 * REGISTRADA → VALIDANDO → PENDIENTE_REVISION → EN_REVISION → APROBADA → ESPERANDO_PAGO → PAGADA → CERRADA
 * 
 * Estados alternativos:
 * - CORRECCION: Si se requieren ajustes por parte del empleado
 * - RECHAZADA: Si no cumple con los requisitos
 */
export enum EstadoIncapacidad {
  /** Incapacidad recién creada, esperando validación inicial */
  REGISTRADA = 'REGISTRADA',
  
  /** En proceso de validación de documentos y datos */
  VALIDANDO = 'VALIDANDO',
  
  /** Requiere correcciones por parte del empleado */
  CORRECCION = 'CORRECCION',
  
  /** Esperando revisión por parte de RRHH */
  PENDIENTE_REVISION = 'PENDIENTE_REVISION',
  
  /** Siendo revisada actualmente por RRHH */
  EN_REVISION = 'EN_REVISION',
  
  /** Incapacidad aprobada, autorizada para pago */
  APROBADA = 'APROBADA',
  
  /** Incapacidad rechazada por incumplir requisitos */
  RECHAZADA = 'RECHAZADA',
  
  /** Aprobada y en cola de pago */
  ESPERANDO_PAGO = 'ESPERANDO_PAGO',
  
  /** Pago completado exitosamente */
  PAGADA = 'PAGADA',
  
  /** Proceso finalizado y archivado */
  CERRADA = 'CERRADA',
}

export enum FormatoReporte {
  CSV = 'CSV',
  PDF = 'PDF',
}

export enum Rol {
  EMPLEADO = 'EMPLEADO',
  RRHH = 'RRHH',
  ADMIN = 'ADMIN',
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
}

export enum TipoNotificacion {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}
