import { Injectable } from '@angular/core';

// Agregamos { providedIn: 'root' } para no tener que ponerlo en providers del app.config
@Injectable({ providedIn: 'root' })
export class UserService {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  currentRole(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.rol || 'guest';
      } catch (e) {
        return 'guest';
      }
    }
    return 'guest';
  }
}
