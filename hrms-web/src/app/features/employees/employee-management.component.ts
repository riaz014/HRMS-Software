import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Employee, UpsertEmployeePayload } from './models/employee.model';
import { EmployeeFormDialogComponent } from './components/employee-form-dialog.component';
import { EmployeeFormDialogData } from './components/employee-form-dialog.component';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.scss'
})
export class EmployeeManagementComponent implements OnInit, AfterViewInit {
  readonly displayedColumns = ['serial', 'employeeNumber', 'fullName', 'position', 'contactNumber', 'email', 'accountNumber', 'departmentName', 'dateOfJoining', 'employmentStatus', 'actions'];
  readonly dataSource = new MatTableDataSource<Employee>([]);

  @ViewChild(MatSort) sort!: MatSort;

  loading = false;
  totalEmployees = 0;

  constructor(
    private readonly apiService: ApiService,
    private readonly dialog: MatDialog,
    private readonly toast: ToastService
  ) {
    this.dataSource.filterPredicate = (employee, filterText) => {
      const value = filterText.trim().toLowerCase();
      return [
        employee.employeeNumber,
        employee.fullName,
        employee.position,
        employee.contactNumber,
        employee.accountNumber,
        employee.email,
        employee.departmentName,
        employee.departmentId.toString(),
        employee.employmentStatus
      ]
        .join(' ')
        .toLowerCase()
        .includes(value);
    };
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value;
  }

  private openEmployeeDialog(data: EmployeeFormDialogData) {
    return this.dialog.open(EmployeeFormDialogComponent, {
      data,
      disableClose: true,
      width: '920px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      panelClass: 'employee-form-dialog-panel'
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.openEmployeeDialog({ mode: 'create' });

    dialogRef.afterClosed().subscribe((payload?: UpsertEmployeePayload) => {
      if (!payload) {
        return;
      }

      this.apiService
        .post<UpsertEmployeePayload, Employee>('employee', payload)
        .subscribe({
          next: () => {
            this.toast.success('Employee created successfully.', 2500);
            this.loadEmployees();
          },
          error: (error) => this.toast.error(this.getApiErrorMessage(error, 'Failed to create employee.'), 3500)
        });
    });
  }

  openEditDialog(employee: Employee): void {
    const dialogRef = this.openEmployeeDialog({
      mode: 'edit',
      employee: {
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        contactNumber: employee.contactNumber,
        position: employee.position,
        accountNumber: employee.accountNumber,
        employmentStatus: employee.employmentStatus,
        dateOfJoining: employee.dateOfJoining.split('T')[0],
        departmentId: employee.departmentId
      }
    });

    dialogRef.afterClosed().subscribe((payload?: UpsertEmployeePayload) => {
      if (!payload) {
        return;
      }

      this.apiService
        .put<UpsertEmployeePayload, Employee>(`employee/${employee.id}`, payload)
        .subscribe({
          next: () => {
            this.toast.success('Employee updated successfully.', 2500);
            this.loadEmployees();
          },
          error: (error) => this.toast.error(this.getApiErrorMessage(error, 'Failed to update employee.'), 3500)
        });
    });
  }

  deleteEmployee(employee: Employee): void {
    const shouldDelete = confirm(`Delete employee ${employee.fullName}?`);

    if (!shouldDelete) {
      return;
    }

    this.apiService.delete<void>(`employee/${employee.id}`).subscribe({
      next: () => {
        this.toast.success('Employee deleted.', 2500);
        this.loadEmployees();
      },
      error: (error) => this.toast.error(this.getApiErrorMessage(error, 'Failed to delete employee.'), 3500)
    });
  }

  private loadEmployees(): void {
    this.loading = true;

    this.apiService
      .get<Employee[]>('employee', undefined, { useCache: false })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (employees) => {
          this.dataSource.data = employees;
          this.totalEmployees = employees.length;
        },
        error: (error) => {
          this.toast.error(this.getApiErrorMessage(error, 'Unable to load employees.'), 3500);
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
