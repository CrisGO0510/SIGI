export interface DocumentFile {
  id: string;
  incapacidad_id: string;
  nombre_archivo: string;
  formato: string;
  tamano_bytes: number;
  validado: boolean;
  detalle_validacion: string;
  fecha_subida: string;
  url_publica: string;
}
