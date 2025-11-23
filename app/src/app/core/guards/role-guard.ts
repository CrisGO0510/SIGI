import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '../services/user';
import { UserRoleEnum } from '../../modules/auth/interfaces/user-role.enum';

export const roleGuard =
  (allowed: UserRoleEnum[]): CanActivateFn =>
  () => {
    const userService = inject(UserService);
    const role = userService.currentRole();

    if (!role) {
      return false;
    }

    return allowed.includes(role);
  };
