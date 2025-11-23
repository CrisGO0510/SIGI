import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/services/user';
import { UserRoleEnum } from '../../modules/auth/interfaces/user-role.enum';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private userService = inject(UserService);

  userRole: UserRoleEnum | null = null;
  roles = UserRoleEnum;

  ngOnInit() {
    this.userRole = this.userService.currentRole();
  }

  get canViewReports(): boolean {
    return (
      this.userRole === this.roles.admin || this.userRole === this.roles.rrhh
    );
  }
}
