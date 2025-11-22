import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '../services/user';

export const roleGuard =
  (allowed: string[]): CanActivateFn =>
  () => {
    const userService = inject(UserService);
    const role = userService.currentRole();

    return allowed.includes(role);
  };
