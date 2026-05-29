import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

interface LoginResponse {
  access_token: string;
  user: { id: number; email: string };
}

interface RefreshResponse {
  access_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // Access token lives in memory only — never persisted to localStorage
  private accessToken: string | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  register(email: string, password: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/register', { email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        this.accessToken = res.access_token;
        this.currentUserSubject.next({ userId: res.user.id, email: res.user.email });
      }),
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    return this.api.post<RefreshResponse>('/auth/refresh').pipe(
      tap((res) => {
        this.accessToken = res.access_token;
      }),
    );
  }

  logout(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/logout').pipe(
      tap(() => {
        this.accessToken = null;
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }),
    );
  }

  me(): Observable<User> {
    return this.api.get<User>('/auth/me');
  }
}
