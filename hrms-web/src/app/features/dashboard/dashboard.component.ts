import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
  subtext?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly modules: ModuleCard[] = [
    {
      title: 'Employee Management',
      description: 'Add, edit, delete, search, and filter employee records with full profile management.',
      route: '/employees',
      icon: 'people',
      color: 'blue',
      stats: '150+ Employees'
    },
    {
      title: 'Salary Management',
      description: 'Manage base salary, bonuses, allowances, revisions, and effective date ranges.',
      route: '/salary',
      icon: 'attach_money',
      color: 'green',
      stats: '150+ Salaries'
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

  readonly stats: StatCard[] = [
    { 
      label: 'Total Employees', 
      value: '150', 
      icon: 'people', 
      color: '#667eea',
      subtext: 'Active in system'
    },
    { 
      label: 'Active Payroll', 
      value: '150', 
      icon: 'check_circle', 
      color: '#48bb78',
      subtext: 'Processed this month'
    },
    { 
      label: 'Pending Reviews', 
      value: '8', 
      icon: 'pending_actions', 
      color: '#f6ad55',
      subtext: 'Awaiting approval'
    }
  ];

  readonly recentActivity = [
    { action: 'Added new employee', date: 'Today', icon: 'person_add' },
    { action: 'Payroll processed', date: '2 days ago', icon: 'done_all' },
    { action: 'Salary updated', date: '5 days ago', icon: 'edit' },
    { action: 'Leave request approved', date: '1 week ago', icon: 'check' }
  ];
}


