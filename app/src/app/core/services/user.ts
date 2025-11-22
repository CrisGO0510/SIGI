import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  private loggedIn = false;
  private role = 'guest';

  isLoggedIn() {
    return this.loggedIn;
  }
  login() {
    this.loggedIn = true;
  }
  logout() {
    this.loggedIn = false;
  }
  currentRole() {
    return this.role;
  }
}
