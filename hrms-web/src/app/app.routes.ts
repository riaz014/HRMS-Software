import { Routes } from '@angular/router';
import { EmployeeManagementComponent } from './features/employees/employee-management.component';
import { PayrollDashboardComponent } from './features/payroll-dashboard/payroll-dashboard.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'employees',
		pathMatch: 'full'
	},
	{
		path: 'employees',
		component: EmployeeManagementComponent
	},
	{
		path: 'payroll-dashboard',
		component: PayrollDashboardComponent
	}
];
