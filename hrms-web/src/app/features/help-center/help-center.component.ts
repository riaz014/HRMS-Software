import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.scss'
})
export class HelpCenterComponent implements OnInit, OnDestroy {
  currentRole: string | null = null;
  private authSubscription?: Subscription;
  private readonly isBrowser: boolean;

  constructor(
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.getCurrentUser().subscribe((user) => {
      this.currentRole = user?.role ?? null;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  get isAdmin(): boolean {
    return this.currentRole === 'Admin';
  }

  get isHrManager(): boolean {
    return this.currentRole === 'HR_Manager';
  }

  get roleTitle(): string {
    if (this.isAdmin) {
      return 'Administrator';
    }

    if (this.isHrManager) {
      return 'HR Manager';
    }

    return 'Team Member';
  }

  scrollToSection(sectionId: string): void {
    if (!this.isBrowser) {
      return;
    }

    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
