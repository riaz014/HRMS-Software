export interface SalaryResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  basicAmount: number;
  allowanceAmount: number;
  deductionAmount: number;
  totalCompensation: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface CreateSalaryRequest {
  employeeId: number;
  basicAmount: number;
  allowanceAmount: number;
  deductionAmount: number;
  effectiveFrom: string;
}

export interface UpdateSalaryRequest {
  basicAmount: number;
  allowanceAmount: number;
  deductionAmount: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}
