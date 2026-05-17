import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { Employee } from './features/employees/models/employee.model';
import { SalaryResponse } from './shared/models/salary.models';
import { PayrollReport } from './shared/models/payroll.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  isAppInitializing = true;
  currentUsername: string | null = null;
  currentRole: string | null = null;
  employeeCount = 0;
  salaryCount = 0;
  payrollCount = 0;
  private readonly isBrowser: boolean;
  private authResolved = false;
  private initialNavigationResolved = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initialNavigationResolved = !this.isBrowser || this.router.navigated;

    if (this.isBrowser && !this.initialNavigationResolved) {
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)
      ).subscribe(() => {
        this.initialNavigationResolved = true;
        this.updateInitializationState();
      });
    }

    if (this.isBrowser) {
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ).subscribe(() => {
        if (this.isAuthenticated) {
          this.refreshModuleCounts();
        }
      });
    }

    this.authService.getCurrentUser().subscribe((user) => {
      this.isAuthenticated = user !== null;
      this.currentUsername = user?.username || null;
      this.currentRole = user?.role || null;

      if (this.isAuthenticated) {
        this.refreshModuleCounts();
      } else {
        this.employeeCount = 0;
        this.salaryCount = 0;
        this.payrollCount = 0;
      }

      this.authResolved = true;
      this.updateInitializationState();
    });
  }

  private updateInitializationState(): void {
    this.isAppInitializing = !(this.authResolved && this.initialNavigationResolved);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToHomeAndRefresh(): void {
    this.router.navigate(['/dashboard']).then(() => {
      window.location.reload();
    });
  }

  getUserInitials(): string {
    if (!this.currentUsername) return '';
    const names = this.currentUsername.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getCurrentRole(): string {
    if (!this.currentRole) return '';
    return this.currentRole === 'Admin' ? 'Administrator' : this.currentRole;
  }

  private refreshModuleCounts(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    forkJoin({
      employees: this.apiService.get<Employee[]>('employee', undefined, { useCache: false }),
      salaries: this.apiService.get<SalaryResponse[]>('salary', undefined, { useCache: false }),
      payroll: this.apiService.get<PayrollReport>('payroll/report', { year, month }, { useCache: false })
    }).subscribe({
      next: ({ employees, salaries, payroll }) => {
        this.employeeCount = employees.length;
        this.salaryCount = salaries.length;
        this.payrollCount = payroll.totalTransactions;
      },
      error: () => {
        this.employeeCount = 0;
        this.salaryCount = 0;
        this.payrollCount = 0;
      }
    });
  }
}

