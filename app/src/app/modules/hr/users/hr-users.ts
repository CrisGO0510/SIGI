import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HrService } from '../services/hr.services';
import { UserResponse } from '../../auth/interfaces/user-response.interface';
import { UserRoleEnum } from '../../auth/interfaces/user-role.enum';
import { ToastService } from '../../../shared/components/toast/toast.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './hr-users.html',
  styleUrls: ['./hr-users.scss'],
})
export class HrUsersComponent implements OnInit {
  private hrService = inject(HrService);
  private toast = inject(ToastService);
  private router = inject(Router);

  displayedColumns: string[] = ['nombre', 'email', 'rol', 'fecha', 'acciones'];
  dataSource = new MatTableDataSource<UserResponse>([]);

  nameFilter = new FormControl('');
  roleFilter = new FormControl('');

  rolesEnum = UserRoleEnum;
  rolesList = Object.values(UserRoleEnum);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = true;

  ngOnInit() {
    this.loadUsers();
    this.setupCustomFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.loading = true;
    this.hrService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.loading = false;
      },
    });
  }

  setupCustomFilter() {
    this.dataSource.filterPredicate = (data: UserResponse, filter: string) => {
      const searchTerms = JSON.parse(filter);

      const nameMatch =
        data.nombre.toLowerCase().indexOf(searchTerms.name) !== -1;

      const roleMatch = searchTerms.role ? data.rol === searchTerms.role : true;

      return nameMatch && roleMatch;
    };

    this.nameFilter.valueChanges.subscribe((name) => {
      this.applyFilter(name, this.roleFilter.value);
    });

    this.roleFilter.valueChanges.subscribe((role) => {
      this.applyFilter(this.nameFilter.value, role);
    });
  }

  applyFilter(name: string | null, role: string | null) {
    const filterValues = {
      name: name?.toLowerCase() || '',
      role: role || '',
    };
    this.dataSource.filter = JSON.stringify(filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRoleClass(role: UserRoleEnum): string {
    switch (role) {
      case UserRoleEnum.admin:
        return 'role-admin';
      case UserRoleEnum.rrhh:
        return 'role-rrhh';
      case UserRoleEnum.employment:
        return 'role-empleado';
      default:
        return '';
    }
  }

  showIncapacities(user: UserResponse) {
    if (user.rol !== UserRoleEnum.employment) {
      this.toast.info(
        'Solo se pueden ver las incapacidades de usuarios con rol Empleado.',
      );
      return;
    }

    this.router.navigate(['/hr/incapacities/history'], { state: { user } });
  }
}
