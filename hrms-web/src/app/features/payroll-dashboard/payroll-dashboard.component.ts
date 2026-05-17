import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { finalize, firstValueFrom } from 'rxjs';
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

  get totalPayrollTransactions(): number {
    return this.monthlyReport?.totalTransactions ?? 0;
  }

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
    const periodLabel = this.getPeriodLabel(payload.month, payload.year);
    this.generating = true;

    this.apiService
      .post<GenerateMonthlyPayrollPayload, GenerateMonthlyPayrollResponse>('payroll/generate-monthly', payload)
      .pipe(finalize(() => (this.generating = false)))
      .subscribe({
        next: (response) => {
          const message = this.buildPayrollGenerationMessage(response, periodLabel);

          if (response.generatedCount > 0) {
            this.toast.success(message, 5000);
          } else {
            this.toast.info(message, 5000);
          }

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
      .get<RecentPayrollItem[]>('payroll/recent', { take: 20 }, { useCache: false })
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
    const periodLabel = this.getPeriodLabel(month, year);

    this.loadingReport = true;

    this.apiService
      .get<PayrollReport>('payroll/report', { year, month }, { useCache: false })
      .pipe(finalize(() => (this.loadingReport = false)))
      .subscribe({
        next: (report) => {
          this.monthlyReport = report;
          if (showSuccessToast) {
            this.toast.success(`Monthly report loaded for ${periodLabel}.`, 2500);
          }
        },
        error: () => {
          this.monthlyReport = null;
          this.toast.error(`Could not load payroll report for ${periodLabel}.`, 3500);
        }
      });
  }

  async exportMonthlyReportToXlsx(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please enter a valid year and month before exporting.', 3000);
      return;
    }

    const year = this.form.controls.year.value;
    const month = this.form.controls.month.value;
    const periodLabel = this.getPeriodLabel(month, year);

    this.loadingReport = true;

    let report: PayrollReport;
    try {
      report = await firstValueFrom(this.apiService.get<PayrollReport>('payroll/report', { year, month }, { useCache: false }));
      this.monthlyReport = report;
    } catch {
      this.loadingReport = false;
      this.toast.error(`Could not load payroll report for ${periodLabel}.`, 3500);
      return;
    }

    this.loadingReport = false;

    const { utils, writeFile } = await import('xlsx');
    const exportPeriodLabel = this.getPeriodLabel(report.month, report.year);

    const summaryRows = [
      { Metric: 'Period', Value: exportPeriodLabel },
      { Metric: 'Transactions', Value: report.totalTransactions },
      { Metric: 'Gross Total', Value: report.totalGrossPay },
      { Metric: 'Deductions Total', Value: report.totalDeductions },
      { Metric: 'Net Total', Value: report.totalNetPay }
    ];

    const itemRows = report.items.map((item, index) => ({
      Sl: index + 1,
      EmployeeNumber: item.employeeNumber,
      EmployeeName: item.employeeName,
      EmployeeId: item.employeeId,
      Month: report.month,
      Year: report.year,
      GrossPay: Number(item.grossPay.toFixed(2)),
      Deductions: Number(item.deductions.toFixed(2)),
      NetPay: Number(item.netPay.toFixed(2)),
      ProcessedAt: new Date(item.processedAtUtc).toLocaleString(),
      Status: 'Processed'
    }));

    const workbook = utils.book_new();
    const summarySheet = utils.json_to_sheet(summaryRows);
    const itemsSheet = utils.json_to_sheet(itemRows);

    utils.book_append_sheet(workbook, summarySheet, 'Summary');
    utils.book_append_sheet(workbook, itemsSheet, 'Transactions');

    writeFile(workbook, `payroll-report-${report.year}-${report.month.toString().padStart(2, '0')}.xlsx`);
    this.toast.success(`All employees salary data exported for ${exportPeriodLabel}.`, 2500);
  }

  getMonthlyReportPeriodLabel(): string {
    if (!this.monthlyReport) {
      return '';
    }

    return this.getPeriodLabel(this.monthlyReport.month, this.monthlyReport.year);
  }

  private getPeriodLabel(month: number, year: number): string {
    const date = new Date(year, Math.max(0, month - 1), 1);
    const monthName = date.toLocaleString(undefined, { month: 'long' });
    return `${monthName} ${year}`;
  }

  private buildPayrollGenerationMessage(response: GenerateMonthlyPayrollResponse, periodLabel: string): string {
    if (response.generatedCount === 0 && response.updatedCount === 0) {
      if (response.skippedNoSalaryCount === 0) {
        return `No new payroll generated for ${periodLabel}. Payroll for all ${response.activeEmployeesCount} active employees is already processed.`;
      }

      return `No payroll generated for ${periodLabel}. Missing salary setup: ${response.skippedNoSalaryCount}. Active employees: ${response.activeEmployeesCount}.`;
    }

    return [
      `Payroll run completed for ${periodLabel}.`,
      `Generated: ${response.generatedCount}`,
      `Updated: ${response.updatedCount}`,
      `Skipped (no salary setup): ${response.skippedNoSalaryCount}`,
      `Active employees: ${response.activeEmployeesCount}`
    ].join(' ');
  }
}
