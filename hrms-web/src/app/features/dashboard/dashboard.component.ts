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
      stats: '50+ Employees'
    },
    {
      title: 'Salary Management',
      description: 'Manage base salary, bonuses, allowances, revisions, and effective date ranges.',
      route: '/salary',
      icon: 'attach_money',
      color: 'green',
      stats: '50+ Salaries'
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

  readonly stats = [
    { label: 'Total Employees', value: '50', icon: 'people', color: '#667eea' },
    { label: 'Active Payroll', value: '12', icon: 'check_circle', color: '#48bb78' },
    { label: 'Pending Reviews', value: '3', icon: 'pending_actions', color: '#f6ad55' }
  ];
}

