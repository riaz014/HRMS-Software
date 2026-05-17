export interface GenerateMonthlyPayrollPayload {
  year: number;
  month: number;
  taxPercentage: number;
  additionalBonus: number;
  additionalDeductions: number;
}

export interface GenerateMonthlyPayrollResponse {
  year: number;
  month: number;
  activeEmployeesCount: number;
  generatedCount: number;
  updatedCount: number;
  skippedExistingCount: number;
  skippedNoSalaryCount: number;
}

export interface RecentPayrollItem {
  payrollId: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  payrollYear: number;
  payrollMonth: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  processedAtUtc: string;
  status: string;
}

export interface PayrollReportItem {
  payrollId: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  processedAtUtc: string;
}

export interface PayrollReport {
  year: number;
  month: number;
  totalTransactions: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  items: PayrollReportItem[];
}
