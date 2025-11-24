import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IncapacityService } from '../incapacity.service';
import { Router, RouterLink } from '@angular/router';
import {
  Incapacity,
  IncapacityStatusEnum,
} from '../../../../core/models/incapacity.model';
import { UserResponse } from '../../../auth/interfaces/user-response.interface';

@Component({
  selector: 'app-incapacities-status',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReactiveFormsModule,
    BaseChartDirective,
    RouterLink,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './hr-incapacities-status.html',
  styleUrls: ['./hr-incapacities-status.scss'],
})
export class IncapacitiesStatus implements OnInit {
  displayedColumns: string[] = [
    'fecha_inicio',
    'motivo',
    'dias',
    'monto',
    'estado',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Incapacity>([]);

  private incapacityService = inject(IncapacityService);
  private router = inject(Router);

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#fff' } },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }],
  };
  public pieChartType: ChartType = 'pie';

  rawResponse: Incapacity[] = [];

  user?: UserResponse;

  ngOnInit() {
    this.user = history.state.user;
    this.loadIncapacities();
    this.setupDateFilter();
  }

  loadIncapacities() {
    this.incapacityService.getAllIncapacities(this.user?.id).subscribe({
      next: (data) => {
        this.rawResponse = data;
        this.processData(data);
      },
      error: (err) => {
        console.error('Error cargando incapacidades:', err);
      },
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  processData(data: any[]) {
    const mappedData = data.map((item) => {
      return {
        ...item,
        statusEnum: this.mapBackendStatusToEnum(item.estado),
      } as Incapacity;
    });

    this.dataSource.data = mappedData;
    this.updateChart(mappedData);
  }

  mapBackendStatusToEnum(backendStatus: string): IncapacityStatusEnum {
    const map: { [key: string]: IncapacityStatusEnum } = {
      REGISTRADA: IncapacityStatusEnum.registered,
      VALIDANDO: IncapacityStatusEnum.validating,
      PENDIENTE_REVISION: IncapacityStatusEnum.pendingReview,
      EN_REVISION: IncapacityStatusEnum.inReview,
      APROBADA: IncapacityStatusEnum.approved,
      RECHAZADA: IncapacityStatusEnum.rejected,
      CORRECCION: IncapacityStatusEnum.correction,
      ESPERANDO_PAGO: IncapacityStatusEnum.awaitingPayment,
      PAGADA: IncapacityStatusEnum.paid,
      CERRADA: IncapacityStatusEnum.closed,
    };
    return map[backendStatus] || IncapacityStatusEnum.registered;
  }

  private setupDateFilter() {
    this.dataSource.filterPredicate = (data: Incapacity, filter: string) => {
      if (this.range.value.start && this.range.value.end) {
        const itemDate = new Date(data.fecha_inicio);
        const start = this.range.value.start;
        const end = this.range.value.end;

        end.setHours(23, 59, 59);
        return itemDate >= start && itemDate <= end;
      }
      return true;
    };

    this.range.valueChanges.subscribe(() => {
      if (this.range.value.start && this.range.value.end) {
        this.dataSource.filter = '' + Math.random();
        this.updateChart(this.dataSource.filteredData);
      }
    });
  }

  resetFilters() {
    this.range.reset();
    this.dataSource.filter = '';
    this.updateChart(this.dataSource.data);
  }

  updateChart(data: Incapacity[]) {
    const counts: { [key: string]: number } = {};

    data.forEach((d) => {
      const status = d.estado;
      counts[status] = (counts[status] || 0) + 1;
    });

    this.pieChartData = {
      labels: Object.keys(counts).map((k) => k.toUpperCase()),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [
            '#4caf50',
            '#f44336',
            '#ff9800',
            '#2196f3',
            '#9c27b0',
          ],
        },
      ],
    };
  }

  getStatusClass(status: IncapacityStatusEnum | undefined): string {
    return status ? `status-${status}` : '';
  }

  editIncapacity(incapacityId: number) {
    this.router.navigate(['/hr/incapacities/form'], {
      state: { incapacityId },
    });
  }
  goToDocuments(incapacity: Incapacity) {
    this.router.navigate(['/documents/viewer'], { state: { incapacity } });
  }
}
