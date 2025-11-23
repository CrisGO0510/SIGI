export enum ToastType {
  SUCCESS = 'check_circle',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface ToastData {
  message: string;
  type: ToastType;
}
