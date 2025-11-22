import { UserRoleEnum } from "./user-role.enum";

export interface UserResponse {
  id: string;
  nombre: string;
  email: string;
  rol: UserRoleEnum;
}
