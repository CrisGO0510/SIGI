import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../database/entities/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
