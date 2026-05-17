import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { CreateSalaryRequest, SalaryResponse, UpdateSalaryRequest } from '../../shared/models/salary.models';
import { SalaryFormDialogComponent } from './components/salary-form-dialog.component';

@Component({
  selector: 'app-salary-management',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './salary-management.component.html',
  styleUrl: './salary-management.component.scss'
})
export class SalaryManagementComponent implements OnInit {
  readonly displayedColumns = ['employee', 'base', 'allowance', 'deduction', 'total', 'effectiveFrom', 'effectiveTo', 'actions'];
  readonly dataSource = new MatTableDataSource<SalaryResponse>([]);
  loading = false;
  totalSalaryRecords = 0;

  constructor(
    private readonly apiService: ApiService,
    private readonly toast: ToastService,
    private readonly dialog: MatDialog
  ) {
    this.dataSource.filterPredicate = (row, filterText) => {
      const value = filterText.trim().toLowerCase();
      return `${row.employeeName} ${row.employeeNumber} ${row.employeeId}`.toLowerCase().includes(value);
    };
  }

  ngOnInit(): void {
    this.loadSalaries();
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SalaryFormDialogComponent, {
      data: { mode: 'create' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((payload?: CreateSalaryRequest) => {
      if (!payload) {
        return;
      }

      this.apiService.post<CreateSalaryRequest, SalaryResponse>('salary', payload).subscribe({
        next: () => {
          this.toast.success('Salary revision created successfully.');
          this.loadSalaries();
        },
        error: (error) => this.toast.error(this.getApiErrorMessage(error, 'Failed to create salary revision.'))
      });
    });
  }

  openEditDialog(salary: SalaryResponse): void {
    const dialogRef = this.dialog.open(SalaryFormDialogComponent, {
      data: { mode: 'edit', salary },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((payload?: UpdateSalaryRequest) => {
      if (!payload) {
        return;
      }

      this.apiService.put<UpdateSalaryRequest, SalaryResponse>(`salary/${salary.id}`, payload).subscribe({
        next: () => {
          this.toast.success('Salary updated successfully.');
          this.loadSalaries();
        },
        error: (error) => this.toast.error(this.getApiErrorMessage(error, 'Failed to update salary.'))
      });
    });
  }

  deleteSalary(salary: SalaryResponse): void {
    const shouldDelete = confirm(`Delete salary record for ${salary.employeeName}?`);

    if (!shouldDelete) {
      return;
    }

    this.apiService.delete<void>(`salary/${salary.id}`).subscribe({
      next: () => {
        this.toast.success('Salary record deleted.');
        this.loadSalaries();
      },
      error: (error) => this.toast.error(this.getApiErrorMessage(error, 'Failed to delete salary record.'))
    });
  }

  private loadSalaries(): void {
    this.loading = true;

    this.apiService
      .get<SalaryResponse[]>('salary', undefined, { useCache: false })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => {
          this.dataSource.data = rows;
          this.totalSalaryRecords = rows.length;
        },
        error: (error) => {
          this.dataSource.data = [];
          this.totalSalaryRecords = 0;
          this.toast.error(this.getApiErrorMessage(error, 'Could not load salary records.'));
        }
      });
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    const payload = error.error as { message?: string; errors?: Record<string, string[] | string> } | null;

    if (payload?.message && payload.message.trim().length > 0) {
      return payload.message;
    }

    if (payload?.errors) {
      const firstKey = Object.keys(payload.errors)[0];

      if (firstKey) {
        const firstError = payload.errors[firstKey];

        if (Array.isArray(firstError) && firstError.length > 0 && firstError[0].trim().length > 0) {
          return firstError[0];
        }

        if (typeof firstError === 'string' && firstError.trim().length > 0) {
          return firstError;
        }
      }
    }

    return fallback;
  }
}
