import { Component, inject } from '@angular/core';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { Footer } from './footer/footer';
import { Router, RouterOutlet } from '@angular/router';
import { UserService } from '../core/services/user';

@Component({
  standalone: true,
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [Header, Sidebar, Footer, RouterOutlet],
})
export class Layout {
  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    const role = this.userService.currentRole();
    if (this.router.url === '/') {
      console.log('Redirecting based on role:', role);

      if (role === 'EMPLEADO') this.router.navigate(['/dashboard']);
      else if (role === 'RRHH' || role === 'ADMIN')
        this.router.navigate(['/hr/dashboard']);
    }
  }
}
