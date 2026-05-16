import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import {
  GenerateMonthlyPayrollPayload,
  GenerateMonthlyPayrollResponse,
  PayrollReport,
  RecentPayrollItem
} from '../../shared/models/payroll.models';

@Component({
  selector: 'app-payroll-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './payroll-dashboard.component.html',
  styleUrl: './payroll-dashboard.component.scss'
})
export class PayrollDashboardComponent implements OnInit {
  readonly displayedColumns = ['employee', 'period', 'grossPay', 'deductions', 'netPay', 'status', 'processedAt', 'actions'];
  readonly form;

  recentPayments: RecentPayrollItem[] = [];
  monthlyReport: PayrollReport | null = null;
  loadingRecent = false;
  loadingReport = false;
  generating = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly toast: ToastService
  ) {
    this.form = this.formBuilder.nonNullable.group({
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(3000)]],
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      taxPercentage: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      additionalBonus: [0, [Validators.required, Validators.min(0)]],
      additionalDeductions: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadRecentPayments();
    this.loadMonthlyReport(false);
  }

  generateMonthlyPayroll(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: GenerateMonthlyPayrollPayload = this.form.getRawValue();
    this.generating = true;

    this.apiService
      .post<GenerateMonthlyPayrollPayload, GenerateMonthlyPayrollResponse>('payroll/generate-monthly', payload)
      .pipe(finalize(() => (this.generating = false)))
      .subscribe({
        next: (response) => {
          this.toast.success(
            `Payroll generated for ${response.generatedCount}/${response.activeEmployeesCount} active employees.`,
            4000
          );
          this.loadRecentPayments();
          this.loadMonthlyReport(false);
        },
        error: () => {
          this.toast.error('Failed to generate monthly payroll.', 3500);
        }
      });
  }

  async exportPayslipToPdf(item: RecentPayrollItem): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const periodLabel = `${item.payrollMonth.toString().padStart(2, '0')}/${item.payrollYear}`;

    doc.setFontSize(18);
    doc.text('HRMS Payslip', 14, 20);

    doc.setFontSize(11);
    doc.text(`Employee: ${item.employeeName} (${item.employeeNumber})`, 14, 35);
    doc.text(`Employee ID: ${item.employeeId}`, 14, 43);
    doc.text(`Payroll Period: ${periodLabel}`, 14, 51);
    doc.text(`Processed At: ${new Date(item.processedAtUtc).toLocaleString()}`, 14, 59);
    doc.text(`Status: ${item.status}`, 14, 67);

    doc.setDrawColor(180, 180, 180);
    doc.line(14, 73, 196, 73);

    doc.setFontSize(12);
    doc.text(`Base + Bonus (Gross): ${item.grossPay.toFixed(2)}`, 14, 86);
    doc.text(`Taxes + Deductions: ${item.deductions.toFixed(2)}`, 14, 95);

    doc.setFontSize(14);
    doc.text(`Net Pay: ${item.netPay.toFixed(2)}`, 14, 110);

    const fileName = `payslip-${item.employeeNumber}-${item.payrollYear}-${item.payrollMonth}.pdf`;
    doc.save(fileName);
  }

  private loadRecentPayments(): void {
    this.loadingRecent = true;

    this.apiService
      .get<RecentPayrollItem[]>('payroll/recent', { take: 20 })
      .pipe(finalize(() => (this.loadingRecent = false)))
      .subscribe({
        next: (items) => {
          this.recentPayments = items;
        },
        error: () => {
          this.recentPayments = [];
          this.toast.error('Could not load recent payroll payments.', 3500);
        }
      });
  }

  loadMonthlyReport(showSuccessToast = true): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please enter a valid year and month before loading report.', 3000);
      return;
    }

    const year = this.form.controls.year.value;
    const month = this.form.controls.month.value;

    this.loadingReport = true;

    this.apiService
      .get<PayrollReport>('payroll/report', { year, month })
      .pipe(finalize(() => (this.loadingReport = false)))
      .subscribe({
        next: (report) => {
          this.monthlyReport = report;
          if (showSuccessToast) {
            this.toast.success(`Monthly report loaded for ${month}/${year}.`, 2500);
          }
        },
        error: () => {
          this.monthlyReport = null;
          this.toast.error('Could not load payroll report for the selected period.', 3500);
        }
      });
  }
}
