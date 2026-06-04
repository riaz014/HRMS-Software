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
  private static readonly tokenStorageKey = 'hrms_access_token';

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

    if (!this.hasValidAccessToken()) {
      this.clearBrowserAuthStorage();
      this.currentUser$.next(null);
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
    return this.hasValidAccessToken();
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserSync(): AuthUser | null {
    return this.currentUser$.value;
  }

  private hasValidAccessToken(): boolean {
    const token = this.apiService.getAccessToken();

    if (!token) {
      return false;
    }

    const expiresAtSeconds = this.getTokenExpirationEpoch(token);

    if (expiresAtSeconds === null) {
      return false;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (expiresAtSeconds <= nowSeconds) {
      this.apiService.clearAccessToken();
      this.clearBrowserAuthStorage();
      this.currentUser$.next(null);
      return false;
    }

    return true;
  }

  private getTokenExpirationEpoch(token: string): number | null {
    const tokenParts = token.split('.');

    if (tokenParts.length < 2) {
      return null;
    }

    try {
      const payload = JSON.parse(this.base64UrlDecode(tokenParts[1])) as { exp?: unknown };
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return atob(padded);
  }

  private clearBrowserAuthStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem('hrms_user');
    localStorage.removeItem(AuthService.tokenStorageKey);
  }
}
