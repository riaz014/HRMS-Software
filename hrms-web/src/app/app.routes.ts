import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeeManagementComponent } from './features/employees/employee-management.component';
import { PayrollDashboardComponent } from './features/payroll-dashboard/payroll-dashboard.component';
import { SalaryManagementComponent } from './features/salary/salary-management.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full'
	},
	{
		path: 'dashboard',
		component: DashboardComponent
	},
	{
		path: 'employees',
		component: EmployeeManagementComponent
	},
	{
		path: 'salary',
		component: SalaryManagementComponent
	},
	{
		path: 'payroll-dashboard',
		component: PayrollDashboardComponent
	}
];
