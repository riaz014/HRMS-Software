import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

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
  private readonly isBrowser: boolean;
  private authResolved = false;
  private initialNavigationResolved = false;

  constructor(
    private authService: AuthService,
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

    this.authService.getCurrentUser().subscribe((user) => {
      this.isAuthenticated = user !== null;
      this.currentUsername = user?.username || null;
      this.currentRole = user?.role || null;
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
}

