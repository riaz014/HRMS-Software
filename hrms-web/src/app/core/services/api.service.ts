import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
  username: string;
  role: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

export interface AuthUserResponse {
  username: string;
  role: string;
}

export interface ResetUserPasswordRequest {
  username: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private static readonly tokenStorageKey = 'hrms_access_token';
  private static readonly defaultCacheTtlMs = 60_000;
  private readonly isBrowser: boolean;
  private readonly getRequestCache = new Map<string, { expiresAt: number; value$: Observable<unknown> }>();

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    this.clearGetCache();
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/auth/change-password`, request).pipe(
      tap(() => this.clearGetCache())
    );
  }

  createUser(request: CreateUserRequest): Observable<AuthUserResponse> {
    return this.http.post<AuthUserResponse>(`${this.apiBaseUrl}/auth/users`, request).pipe(
      tap(() => this.clearGetCache())
    );
  }

  getUsers(): Observable<AuthUserResponse[]> {
    return this.get<AuthUserResponse[]>('auth/users', undefined, { ttlMs: 30_000 });
  }

  resetUserPassword(request: ResetUserPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/auth/users/reset-password`, request).pipe(
      tap(() => this.clearGetCache())
    );
  }

  get<T>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
    options?: { useCache?: boolean; ttlMs?: number }
  ): Observable<T> {
    const useCache = options?.useCache ?? true;

    if (!useCache) {
      return this.http.get<T>(`${this.apiBaseUrl}/${endpoint}`, {
        params: this.buildHttpParams(queryParams)
      });
    }

    const cacheKey = this.buildCacheKey(endpoint, queryParams);
    const now = Date.now();
    const cached = this.getRequestCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return cached.value$ as Observable<T>;
    }

    const ttlMs = options?.ttlMs ?? ApiService.defaultCacheTtlMs;
    const request$ = this.http.get<T>(`${this.apiBaseUrl}/${endpoint}`, {
      params: this.buildHttpParams(queryParams)
    }).pipe(
      catchError((error) => {
        this.getRequestCache.delete(cacheKey);
        return throwError(() => error);
      }),
      shareReplay(1)
    );

    this.getRequestCache.set(cacheKey, {
      expiresAt: now + ttlMs,
      value$: request$ as Observable<unknown>
    });

    return request$;
  }

  post<TRequest, TResponse>(endpoint: string, payload: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.apiBaseUrl}/${endpoint}`, payload).pipe(
      tap(() => this.clearGetCache())
    );
  }

  put<TRequest, TResponse>(endpoint: string, payload: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.apiBaseUrl}/${endpoint}`, payload).pipe(
      tap(() => this.clearGetCache())
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiBaseUrl}/${endpoint}`).pipe(
      tap(() => this.clearGetCache())
    );
  }

  setAccessToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(ApiService.tokenStorageKey, token);
  }

  clearAccessToken(): void {
    this.clearGetCache();

    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(ApiService.tokenStorageKey);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem(ApiService.tokenStorageKey);
  }

  private buildHttpParams(queryParams?: Record<string, string | number | boolean | null | undefined>): HttpParams {
    let params = new HttpParams();

    if (!queryParams) {
      return params;
    }

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    }

    return params;
  }

  private buildCacheKey(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>
  ): string {
    if (!queryParams) {
      return endpoint;
    }

    const normalizedQuery = Object.entries(queryParams)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join('&');

    return normalizedQuery ? `${endpoint}?${normalizedQuery}` : endpoint;
  }

  private clearGetCache(): void {
    this.getRequestCache.clear();
  }
}
