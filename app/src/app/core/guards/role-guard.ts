import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user';
import { ToastService } from '../../shared/components/toast/toast.services';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const currentRole = userService.currentRole();

    // Verificamos si el rol del usuario está en la lista de permitidos
    if (allowedRoles.includes(currentRole!)) {
      return true;
    }

    // Si no tiene permiso
    toast.error('No tienes permisos para acceder a esta sección');
    router.navigate(['/dashboard']); // O al login
    return false;
  };
};
