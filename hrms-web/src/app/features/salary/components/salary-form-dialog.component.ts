import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { Employee } from '../../employees/models/employee.model';
import { CreateSalaryRequest, SalaryResponse, UpdateSalaryRequest } from '../../../shared/models/salary.models';

export interface SalaryFormDialogData {
  mode: 'create' | 'edit';
  salary?: SalaryResponse;
}

@Component({
  selector: 'app-salary-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './salary-form-dialog.component.html',
  styleUrl: './salary-form-dialog.component.scss'
})
export class SalaryFormDialogComponent implements OnInit {
  readonly form;
  employees: Employee[] = [];
  loadingEmployees = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly dialogRef: MatDialogRef<SalaryFormDialogComponent, CreateSalaryRequest | UpdateSalaryRequest>,
    @Inject(MAT_DIALOG_DATA) public readonly data: SalaryFormDialogData
  ) {
    this.form = this.formBuilder.nonNullable.group({
      employeeId: [{ value: data.salary?.employeeId ?? 0, disabled: data.mode === 'edit' }, [Validators.required, Validators.min(1)]],
      basicAmount: [data.salary?.basicAmount ?? 0, [Validators.required, Validators.min(0.01)]],
      allowanceAmount: [data.salary?.allowanceAmount ?? 0, [Validators.required, Validators.min(0)]],
      deductionAmount: [data.salary?.deductionAmount ?? 0, [Validators.required, Validators.min(0)]],
      effectiveFrom: [data.salary?.effectiveFrom?.split('T')[0] ?? '', [Validators.required]],
      effectiveTo: [data.salary?.effectiveTo?.split('T')[0] ?? '']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.dialogRef.close({
        employeeId: Number(raw.employeeId),
        basicAmount: Number(raw.basicAmount),
        allowanceAmount: Number(raw.allowanceAmount),
        deductionAmount: Number(raw.deductionAmount),
        effectiveFrom: this.toApiDate(raw.effectiveFrom) ?? ''
      } satisfies CreateSalaryRequest);
      return;
    }

    const effectiveTo = this.toApiDate(raw.effectiveTo);

    this.dialogRef.close({
      basicAmount: Number(raw.basicAmount),
      allowanceAmount: Number(raw.allowanceAmount),
      deductionAmount: Number(raw.deductionAmount),
      effectiveFrom: this.toApiDate(raw.effectiveFrom) ?? '',
      effectiveTo: effectiveTo && effectiveTo.length > 0 ? effectiveTo : null
    } satisfies UpdateSalaryRequest);
  }

  private toApiDate(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  private loadEmployees(): void {
    this.loadingEmployees = true;

    this.apiService.get<Employee[]>('employee', undefined, { useCache: false }).subscribe({
      next: (employees) => {
        this.employees = [...employees].sort((a, b) => a.employeeNumber.localeCompare(b.employeeNumber));

        if (this.data.mode === 'create' && this.form.controls.employeeId.value <= 0 && this.employees.length > 0) {
          this.form.controls.employeeId.setValue(this.employees[0].id);
        }

        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
      }
    });
  }
}
