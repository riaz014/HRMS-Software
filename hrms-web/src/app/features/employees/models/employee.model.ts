export interface Employee {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dateOfJoining: string;
  isActive: boolean;
  departmentId: number;
  departmentName: string;
}

export interface UpsertEmployeePayload {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfJoining: string;
  departmentId: number;
  isActive: boolean;
}
