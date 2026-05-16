import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/services/api.service';
import { Employee } from '../employees/models/employee.model';
import { RecentPayrollItem } from '../../shared/models/payroll.models';
import { SalaryResponse } from '../../shared/models/salary.models';

interface ModuleCard {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
  stats: string;
}

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  route: string;
  subtext?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}
  
  modules: ModuleCard[] = [
    {
      title: 'Employee Management',
      description: 'Add, edit, delete, search, and filter employee records with full profile management.',
      route: '/employees',
      icon: 'people',
      color: 'blue',
      stats: '0 Employees'
    },
    {
      title: 'Salary Management',
      description: 'Manage base salary, bonuses, allowances, revisions, and effective date ranges.',
      route: '/salary',
      icon: 'attach_money',
      color: 'green',
      stats: '0 Salaries'
    },
    {
      title: 'Payroll Management',
      description: 'Generate monthly payroll, review transactions, calculate deductions and export payslips.',
      route: '/payroll-dashboard',
      icon: 'assessment',
      color: 'purple',
      stats: 'Ready to Process'
    }
  ];

  stats: StatCard[] = [
    { 
      label: 'Total Employees', 
      value: '0', 
      icon: 'people', 
      color: '#667eea',
      route: '/employees',
      subtext: 'Active in system'
    },
    { 
      label: 'Active Payroll', 
      value: '0', 
      icon: 'check_circle', 
      color: '#48bb78',
      route: '/payroll-dashboard',
      subtext: 'Processed this month'
    },
    { 
      label: 'Pending Reviews', 
      value: '0', 
      icon: 'pending_actions', 
      color: '#f6ad55',
      route: '/salary',
      subtext: 'Awaiting approval'
    }
  ];

  openStat(stat: StatCard): void {
    this.router.navigate([stat.route]);
  }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadModuleStats();
  }

  private loadDashboardStats(): void {
    this.loadEmployeeCount();
    this.loadPayrollStats();
  }

  private loadEmployeeCount(): void {
    this.apiService.get<Employee[]>('employee').subscribe({
      next: (employees) => {
        const activeCount = employees.filter(e => e.isActive).length;
        this.stats[0].value = activeCount.toString();
        this.stats[0].subtext = 'Active in system';
      },
      error: () => {
        this.stats[0].value = '0';
      }
    });
  }

  private loadPayrollStats(): void {
    this.apiService.get<RecentPayrollItem[]>('payroll/recent?take=1000').subscribe({
      next: (payrolls) => {
        // Compute current month processed payroll and pending payroll items from real data.
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const currentMonthPayroll = payrolls.filter(p =>
          p.payrollYear === currentYear && p.payrollMonth === currentMonth
        ).length;

        const pendingReviews = payrolls.filter(p => p.status.toLowerCase() !== 'processed').length;

        this.stats[1].value = currentMonthPayroll.toString();
        this.stats[1].subtext = 'Processed this month';

        this.stats[2].value = pendingReviews.toString();
        this.stats[2].subtext = 'Awaiting approval';
      },
      error: () => {
        this.stats[1].value = '0';
        this.stats[2].value = '0';
      }
    });
  }

  private loadModuleStats(): void {
    this.loadEmployeeModuleStats();
    this.loadSalaryModuleStats();
    this.loadPayrollModuleStats();
  }

  private loadEmployeeModuleStats(): void {
    this.apiService.get<Employee[]>('employee').subscribe({
      next: (employees) => {
        const count = employees.length;
        this.modules[0].stats = `${count} Employee${count !== 1 ? 's' : ''}`;
      },
      error: () => {
        this.modules[0].stats = '0 Employees';
      }
    });
  }

  private loadSalaryModuleStats(): void {
    this.apiService.get<SalaryResponse[]>('salary').subscribe({
      next: (salaries) => {
        const count = salaries.length;
        this.modules[1].stats = `${count} Salary${count !== 1 ? ' Records' : ' Record'}`;
      },
      error: () => {
        this.modules[1].stats = '0 Salaries';
      }
    });
  }

  private loadPayrollModuleStats(): void {
    this.apiService.get<RecentPayrollItem[]>('payroll/recent?take=1000').subscribe({
      next: (payrolls) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const currentMonthPayroll = payrolls.filter(p =>
          p.payrollYear === currentYear && p.payrollMonth === currentMonth
        ).length;

        if (currentMonthPayroll > 0) {
          this.modules[2].stats = `Ready to Process (${currentMonthPayroll})`;
        } else {
          this.modules[2].stats = 'Ready to Generate';
        }
      },
      error: () => {
        this.modules[2].stats = 'Ready to Process';
      }
    });
  }

}


