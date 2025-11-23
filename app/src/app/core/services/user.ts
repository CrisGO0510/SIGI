import { Injectable } from '@angular/core';
import { UserRoleEnum } from '../../modules/auth/interfaces/user-role.enum';
import { UserResponse } from '../../modules/auth/interfaces/user-response.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  currentRole(): UserRoleEnum | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user: UserResponse = JSON.parse(userStr);
        return user.rol;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
