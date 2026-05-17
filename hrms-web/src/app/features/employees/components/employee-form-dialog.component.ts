import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { UpsertEmployeePayload } from '../models/employee.model';
import { DepartmentOption, DepartmentResponse } from '../models/department.model';

export interface EmployeeFormDialogData {
  mode: 'create' | 'edit';
  employee?: UpsertEmployeePayload;
}

@Component({
  selector: 'app-employee-form-dialog',
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
  templateUrl: './employee-form-dialog.component.html',
  styleUrl: './employee-form-dialog.component.scss'
})
export class EmployeeFormDialogComponent implements OnInit {
  readonly form;
  readonly employmentStatuses = ['Active', 'Inactive', 'On Leave', 'Terminated'];
  readonly fallbackDepartments: DepartmentOption[] = [
    { id: 1, code: 'FAC', name: 'Faculty' },
    { id: 2, code: 'SD', name: 'Software Development' },
    { id: 3, code: 'HR', name: 'Human Resources' },
    { id: 4, code: 'ADM', name: 'Administration' },
    { id: 5, code: 'AR', name: 'Admissions and Records' },
    { id: 6, code: 'FA', name: 'Finance and Accounts' },
    { id: 7, code: 'ITS', name: 'IT Services' },
    { id: 8, code: 'LIB', name: 'Library Services' },
    { id: 9, code: 'SA', name: 'Student Affairs' },
    { id: 10, code: 'RI', name: 'Research and Innovation' },
    { id: 11, code: 'FM', name: 'Facilities and Maintenance' },
    { id: 12, code: 'PROC', name: 'Procurement' },
    { id: 13, code: 'QA', name: 'Quality Assurance' },
    { id: 14, code: 'EXAM', name: 'Examination Cell' }
  ];

  departments: DepartmentOption[] = [...this.fallbackDepartments];
  loadingDepartments = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly dialogRef: MatDialogRef<EmployeeFormDialogComponent, UpsertEmployeePayload>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EmployeeFormDialogData
  ) {
    this.form = this.formBuilder.nonNullable.group({
      employeeNumber: [this.data.employee?.employeeNumber ?? '', [Validators.required, Validators.maxLength(50)]],
      firstName: [this.data.employee?.firstName ?? '', [Validators.required, Validators.maxLength(100)]],
      lastName: [this.data.employee?.lastName ?? '', [Validators.required, Validators.maxLength(100)]],
      email: [this.data.employee?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(200)]],
      contactNumber: [this.data.employee?.contactNumber ?? '', [Validators.required, Validators.maxLength(30)]],
      position: [this.data.employee?.position ?? '', [Validators.required, Validators.maxLength(100)]],
      accountNumber: [this.data.employee?.accountNumber ?? '', [Validators.required, Validators.maxLength(50)]],
      employmentStatus: [this.data.employee?.employmentStatus ?? 'Active', [Validators.required, Validators.maxLength(30)]],
      dateOfJoining: [this.data.employee?.dateOfJoining ?? '', [Validators.required]],
      departmentId: [this.data.employee?.departmentId ?? this.fallbackDepartments[0].id, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.dialogRef.close({
      employeeNumber: raw.employeeNumber.trim(),
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      email: raw.email.trim(),
      contactNumber: raw.contactNumber.trim(),
      position: raw.position.trim(),
      accountNumber: raw.accountNumber.trim(),
      employmentStatus: raw.employmentStatus.trim(),
      dateOfJoining: raw.dateOfJoining,
      departmentId: Number(raw.departmentId)
    });
  }

  private loadDepartments(): void {
    this.loadingDepartments = true;

    this.apiService.get<DepartmentResponse[]>('department', undefined, { useCache: false }).subscribe({
      next: (departments) => {
        if (!departments.length) {
          this.loadingDepartments = false;
          return;
        }

        this.departments = departments
          .map((department) => ({
            id: department.id,
            name: department.name,
            code: this.resolveDepartmentCode(department.name)
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const selectedDepartmentId = Number(this.form.controls.departmentId.value);
        const hasSelectedDepartment = this.departments.some((department) => department.id === selectedDepartmentId);

        if (!hasSelectedDepartment && this.departments.length) {
          this.form.controls.departmentId.setValue(this.departments[0].id);
        }

        this.loadingDepartments = false;
      },
      error: () => {
        this.loadingDepartments = false;
      }
    });
  }

  private resolveDepartmentCode(name: string): string {
    const normalizedName = name.trim().toLowerCase();
    const configuredCodes: Record<string, string> = {
      'faculty': 'FAC',
      'software development': 'SD',
      'human resources': 'HR',
      'administration': 'ADM',
      'admissions and records': 'AR',
      'finance and accounts': 'FA',
      'it services': 'ITS',
      'library services': 'LIB',
      'student affairs': 'SA',
      'research and innovation': 'RI',
      'facilities and maintenance': 'FM',
      'procurement': 'PROC',
      'quality assurance': 'QA',
      'examination cell': 'EXAM'
    };

    const knownCode = configuredCodes[normalizedName];

    if (knownCode) {
      return knownCode;
    }

    const acronym = name
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 4);

    return acronym || 'DEPT';
  }
}
