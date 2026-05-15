import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService, LoginRequest, LoginResponse } from './api.service';

export interface AuthUser {
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<AuthUser | null>(null);
  private readonly isBrowser: boolean;

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    const userJson = localStorage.getItem('hrms_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser$.next(user);
      } catch (e) {
        localStorage.removeItem('hrms_user');
      }
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.login(request).pipe(
      tap((response: LoginResponse) => {
        this.apiService.setAccessToken(response.accessToken);
        const user: AuthUser = {
          username: response.username,
          role: response.role
        };
        if (this.isBrowser) {
          localStorage.setItem('hrms_user', JSON.stringify(user));
        }
        this.currentUser$.next(user);
      })
    );
  }

  logout(): void {
    this.apiService.clearAccessToken();
    if (this.isBrowser) {
      localStorage.removeItem('hrms_user');
    }
    this.currentUser$.next(null);
  }

  isAuthenticated(): boolean {
    return this.apiService.getAccessToken() !== null;
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserSync(): AuthUser | null {
    return this.currentUser$.value;
  }
}
