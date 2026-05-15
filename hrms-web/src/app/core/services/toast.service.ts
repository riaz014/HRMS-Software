import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private readonly snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  error(message: string, duration = 3500): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['toast-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  info(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['toast-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
