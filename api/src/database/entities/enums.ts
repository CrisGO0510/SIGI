/**
 * Enums para el dominio SIGI
 */

export enum EstadoIncapacidad {
  REGISTRADA = 'REGISTRADA',
  VALIDANDO = 'VALIDANDO',
  CORRECCION = 'CORRECCION',
  PENDIENTE_REVISION = 'PENDIENTE_REVISION',
  EN_REVISION = 'EN_REVISION',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  ESPERANDO_PAGO = 'ESPERANDO_PAGO',
  PAGADA = 'PAGADA',
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
