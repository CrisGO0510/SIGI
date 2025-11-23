import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ToastData, ToastType } from './toast.defs';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [MatIconModule, NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastData,
    public snackBarRef: MatSnackBarRef<ToastData>,
  ) {}

  getIcon(): string {
    return this.data.type;
  }

  getTitle(): string {
    switch (this.data.type) {
      case ToastType.SUCCESS:
        return 'Éxito';
      case ToastType.ERROR:
        return 'Error';
      case ToastType.WARNING:
        return 'Advertencia';
      case ToastType.INFO:
        return 'Información';
      default:
        return '';
    }
  }
}
