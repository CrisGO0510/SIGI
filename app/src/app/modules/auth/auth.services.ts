import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RegisterRequest } from './interfaces/register-request.interface';
import { UserResponse } from './interfaces/user-response.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private api = 'http://localhost:3005/auth/login';

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(this.api, { email, password }).pipe(
      tap((response) => {
        // Guardar token
        localStorage.setItem('access_token', response.access_token);

        // Guardar usuario
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get user(): UserResponse | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  isLogged(): boolean {
    return !!this.token;
  }

  register(data: RegisterRequest) {
    return this.http
      .post<AuthResponse>('http://localhost:3005/auth/register', data)
      .pipe(
        tap((response) => {
          // Se recibe un access_token igual que en login
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }),
      );
  }
}
