import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth-interceptor';
import { errorInterceptor } from './interceptors/error-interceptor';
import { UserService } from './services/user';
import { ApiService } from './services/api';
import { StorageService } from './services/storage';

export const CORE_PROVIDERS = [
  provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  UserService,
  ApiService,
  StorageService,
];
