import { UserResponse } from './user-response.interface';

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
}
