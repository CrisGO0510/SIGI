import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompanyService } from '../company.service';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './company-list.html',
  styleUrls: ['./company-list.scss'],
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  displayedColumns: string[] = ['nombre', 'correo', 'direccion', 'acciones'];
  dataSource = new MatTableDataSource<Company>([]);
  loading = true;

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (err) => console.error(err),
    });
  }

  createCompany() {
    this.router.navigate(['/companies/form']);
  }

  editCompany(id: string) {
    this.router.navigate(['/companies/form'], { state: { companyId: id } });
  }
}
