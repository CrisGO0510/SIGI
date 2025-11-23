import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastType } from './toast.defs';
import { Toast } from './toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private show(message: string, type: ToastType, duration = 4000) {
    this.snackBar.openFromComponent(Toast, {
      data: { message, type },
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'custom-toast-panel',
    });
  }

  success(message: string) {
    this.show(message, ToastType.SUCCESS);
  }

  error(message: string) {
    this.show(message, ToastType.ERROR, 5000);
  }

  warning(message: string) {
    this.show(message, ToastType.WARNING);
  }

  info(message: string) {
    this.show(message, ToastType.INFO);
  }
}
