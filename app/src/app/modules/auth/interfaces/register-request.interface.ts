import { UserRoleEnum } from './user-role.enum';

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: UserRoleEnum;
  empresa_id: string;
}
