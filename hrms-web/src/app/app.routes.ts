import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeeManagementComponent } from './features/employees/employee-management.component';
import { PayrollDashboardComponent } from './features/payroll-dashboard/payroll-dashboard.component';
import { SalaryManagementComponent } from './features/salary/salary-management.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		component: LoginComponent,
		canActivate: [loginGuard]
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [authGuard]
	},
	{
		path: 'employees',
		component: EmployeeManagementComponent,
		canActivate: [authGuard]
	},
	{
		path: 'salary',
		component: SalaryManagementComponent,
		canActivate: [authGuard]
	},
	{
		path: 'payroll-dashboard',
		component: PayrollDashboardComponent,
		canActivate: [authGuard]
	}
];
