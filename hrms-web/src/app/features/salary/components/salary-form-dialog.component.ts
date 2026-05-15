import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateSalaryRequest, SalaryResponse, UpdateSalaryRequest } from '../../../shared/models/salary.models';

export interface SalaryFormDialogData {
  mode: 'create' | 'edit';
  salary?: SalaryResponse;
}

@Component({
  selector: 'app-salary-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './salary-form-dialog.component.html',
  styleUrl: './salary-form-dialog.component.scss'
})
export class SalaryFormDialogComponent {
  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
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
        effectiveFrom: raw.effectiveFrom
      } satisfies CreateSalaryRequest);
      return;
    }

    this.dialogRef.close({
      basicAmount: Number(raw.basicAmount),
      allowanceAmount: Number(raw.allowanceAmount),
      deductionAmount: Number(raw.deductionAmount),
      effectiveFrom: raw.effectiveFrom,
      effectiveTo: raw.effectiveTo?.trim() ? raw.effectiveTo : null
    } satisfies UpdateSalaryRequest);
  }
}
