export enum IncapacityStatusEnum {
  registered = 'REGISTRADA',
  validating = 'VALIDANDO',
  pendingReview = 'PENDIENTE_REVISION',
  inReview = 'EN_REVISION',
  approved = 'APROBADA',
  rejected = 'RECHAZADA',
  correction = 'CORRECCION',
  awaitingPayment = 'ESPERANDO_PAGO',
  paid = 'PAGADA',
  closed = 'CERRADA',
}

export interface Incapacity {
  id: string;
  usuario_id: string;
  fecha_registro: Date;
  fecha_inicio: Date;
  fecha_fin: Date;
  motivo: string;
  monto_solicitado: number;
  estado: IncapacityStatusEnum;
  observaciones: string;
}
