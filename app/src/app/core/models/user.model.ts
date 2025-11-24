import { UserResponse } from '../../modules/auth/interfaces/user-response.interface';

export interface UsersListResponse {
  message: string;
  total: number;
  users: UserResponse[];
}
