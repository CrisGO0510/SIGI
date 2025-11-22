import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
  getToken() {
    return localStorage.getItem('token');
  }
  setToken(token: string) {
    localStorage.setItem('token', token);
  }
  clear() {
    localStorage.clear();
  }
}
