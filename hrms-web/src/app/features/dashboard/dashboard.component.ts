import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly modules = [
    {
      title: 'Employee Management',
      description: 'Add, edit, delete, search, and filter employee records.',
      route: '/employees'
    },
    {
      title: 'Salary Management',
      description: 'Manage base salary, bonuses, revisions, and effective date ranges.',
      route: '/salary'
    },
    {
      title: 'Payroll Management',
      description: 'Generate monthly payroll, review transactions, and export payslips.',
      route: '/payroll-dashboard'
    }
  ];
}
