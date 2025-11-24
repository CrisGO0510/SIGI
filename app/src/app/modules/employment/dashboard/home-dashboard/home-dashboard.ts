import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.services';

@Component({
  selector: 'app-home-dashboard',
  imports: [MatIconModule, MatCardModule, RouterLink],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard implements OnInit {
  userName?: string;

  authService = inject(AuthService);

  ngOnInit() {
    this.userName = this.authService.user?.nombre;
  }
}
