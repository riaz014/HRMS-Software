import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UpsertEmployeePayload } from '../models/employee.model';

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
    MatCheckboxModule
  ],
  templateUrl: './employee-form-dialog.component.html',
  styleUrl: './employee-form-dialog.component.scss'
})
export class EmployeeFormDialogComponent {
  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<EmployeeFormDialogComponent, UpsertEmployeePayload>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EmployeeFormDialogData
  ) {
    this.form = this.formBuilder.nonNullable.group({
      employeeNumber: [this.data.employee?.employeeNumber ?? '', [Validators.required, Validators.maxLength(50)]],
      firstName: [this.data.employee?.firstName ?? '', [Validators.required, Validators.maxLength(100)]],
      lastName: [this.data.employee?.lastName ?? '', [Validators.required, Validators.maxLength(100)]],
      email: [this.data.employee?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(200)]],
      dateOfJoining: [this.data.employee?.dateOfJoining ?? '', [Validators.required]],
      departmentId: [this.data.employee?.departmentId ?? 0, [Validators.required, Validators.min(1)]],
      isActive: [this.data.employee?.isActive ?? true]
    });
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
      dateOfJoining: raw.dateOfJoining,
      departmentId: Number(raw.departmentId),
      isActive: raw.isActive
    });
  }
}
