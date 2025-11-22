import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class ApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000';

  get(path: string) {
    return this.http.get(`${this.base}${path}`);
  }
  post(path: string, data: any) {
    return this.http.post(`${this.base}${path}`, data);
  }
  put(path: string, data: any) {
    return this.http.put(`${this.base}${path}`, data);
  }
  delete(path: string) {
    return this.http.delete(`${this.base}${path}`);
  }
}
