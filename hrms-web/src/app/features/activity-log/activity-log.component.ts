import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ActivityLog } from '../../shared/models/activity.models';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.scss'
})
export class ActivityLogComponent implements OnInit {
  activities: ActivityLog[] = [];
  filteredActivities: ActivityLog[] = [];
  isLoading = false;

  displayedColumns: string[] = ['timestamp', 'module', 'action', 'performedBy', 'status'];
  
  pageSize = 10;
  pageIndex = 0;

  filterModule = '';
  filterStatus = '';
  searchText = '';

  moduleOptions = ['Employee Management', 'Salary Management', 'Payroll Management', 'System'];
  statusOptions = ['success', 'error', 'pending'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadActivityLogs();
  }

  loadActivityLogs(): void {
    this.isLoading = true;
    // For now, we'll use mock data. In production, this would call: this.apiService.get<ActivityLog[]>('activity-log')
    this.activities = this.getMockActivityLogs();
    this.applyFilters();
    this.isLoading = false;
  }

  private getMockActivityLogs(): ActivityLog[] {
    const now = new Date();
    return [
      {
        id: 1,
        action: 'Employee Added',
        description: 'Added new employee record for Rashed Ahmed',
        performedBy: 'hrmanager',
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
        module: 'Employee Management',
        status: 'success'
      },
      {
        id: 2,
        action: 'Salary Updated',
        description: 'Updated salary for employee Ali Siddharth',
        performedBy: 'hrmanager',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        module: 'Salary Management',
        status: 'success'
      },
      {
        id: 3,
        action: 'Payroll Generated',
        description: 'Generated monthly payroll for all active employees',
        performedBy: 'admin',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        module: 'Payroll Management',
        status: 'success'
      },
      {
        id: 4,
        action: 'Employee Updated',
        description: 'Updated employee details for Nadia Khan',
        performedBy: 'hrmanager',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        module: 'Employee Management',
        status: 'success'
      },
      {
        id: 5,
        action: 'Salary Deletion Attempt',
        description: 'Failed to delete salary record - active payroll exists',
        performedBy: 'admin',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        module: 'Salary Management',
        status: 'error'
      },
      {
        id: 6,
        action: 'Database Backup',
        description: 'Automated daily backup completed successfully',
        performedBy: 'system',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        module: 'System',
        status: 'success'
      },
      {
        id: 7,
        action: 'Payroll Report Exported',
        description: 'Exported monthly payroll report for January 2026',
        performedBy: 'admin',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        module: 'Payroll Management',
        status: 'success'
      },
      {
        id: 8,
        action: 'Employee Deleted',
        description: 'Archived employee record for John Smith',
        performedBy: 'admin',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        module: 'Employee Management',
        status: 'success'
      }
    ];
  }

  applyFilters(): void {
    this.filteredActivities = this.activities.filter(activity => {
      const moduleMatch = !this.filterModule || activity.module === this.filterModule;
      const statusMatch = !this.filterStatus || activity.status === this.filterStatus;
      const textMatch = !this.searchText || 
        activity.action.toLowerCase().includes(this.searchText.toLowerCase()) ||
        activity.description.toLowerCase().includes(this.searchText.toLowerCase()) ||
        activity.performedBy.toLowerCase().includes(this.searchText.toLowerCase());
      
      return moduleMatch && statusMatch && textMatch;
    });

    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedActivities(): ActivityLog[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredActivities.slice(startIndex, startIndex + this.pageSize);
  }

  clearFilters(): void {
    this.filterModule = '';
    this.filterStatus = '';
    this.searchText = '';
    this.applyFilters();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'pending':
        return 'schedule';
      default:
        return 'info';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
