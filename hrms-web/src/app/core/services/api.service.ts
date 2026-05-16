import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private static readonly tokenStorageKey = 'hrms_access_token';
  private readonly isBrowser: boolean;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/auth/change-password`, request);
  }

  createUser(request: CreateUserRequest): Observable<AuthUserResponse> {
    return this.http.post<AuthUserResponse>(`${this.apiBaseUrl}/auth/users`, request);
  }

  get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | null | undefined>): Observable<T> {
    return this.http.get<T>(`${this.apiBaseUrl}/${endpoint}`, {
      params: this.buildHttpParams(queryParams)
    });
  }

  post<TRequest, TResponse>(endpoint: string, payload: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.apiBaseUrl}/${endpoint}`, payload);
  }

  put<TRequest, TResponse>(endpoint: string, payload: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.apiBaseUrl}/${endpoint}`, payload);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiBaseUrl}/${endpoint}`);
  }

  setAccessToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(ApiService.tokenStorageKey, token);
  }

  clearAccessToken(): void {
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
}
