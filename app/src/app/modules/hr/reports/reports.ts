import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportsService } from './report.service';
import { DashboardResponse } from '../../../core/models/reports.model';
import { AuthService, CompanySelectOption } from '../../auth/auth.services';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToastService } from '../../../shared/components/toast/toast.services';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
})
export class ReportsComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  companies: CompanySelectOption[] = [];
  data: DashboardResponse | null = null;
  loading = true;
  generating = false;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#ccc' } },
    },
  };
  public pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { color: '#ccc' } },
      y: { ticks: { color: '#ccc' } },
    },
    plugins: { legend: { display: false } },
  };
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  ngOnInit() {
    this.loadData();
    this.loadCompanies();
  }

  loadCompanies() {
    this.authService.getCompanies().subscribe({
      next: (data: CompanySelectOption[]) => (this.companies = data),
      error: (err) => console.error(err),
    });
  }

  reportForm!: FormGroup;

  constructor() {
    this.reportForm = this.fb.group({
      empresa_id: ['', Validators.required],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
    });
  }

  loadData() {
    this.loading = true;
    this.reportsService.getDashboardData().subscribe({
      next: (response) => {
        this.data = response;
        this.setupCharts(response);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reportes', err);
        this.loading = false;
      },
    });
  }

  setupCharts(data: DashboardResponse) {
    const estadosLabels = Object.keys(data.estadisticas.porEstado);
    const estadosValues = Object.values(data.estadisticas.porEstado);

    this.pieChartData = {
      labels: estadosLabels.map((l) => l.replace('_', ' ')),
      datasets: [
        {
          data: estadosValues,
          backgroundColor: [
            '#2196f3',
            '#ff9800',
            '#4caf50',
            '#f44336',
            '#9c27b0',
          ],
          borderColor: '#1e1e1e',
          borderWidth: 2,
        },
      ],
    };

    this.barChartData = {
      labels: data.estadisticas.porMes.map((m) => m.mes),
      datasets: [
        {
          data: data.estadisticas.porMes.map((m) => m.cantidad),
          label: 'Incapacidades',
          backgroundColor: '#3f51b5',
          borderRadius: 4,
        },
      ],
    };
  }

  getTrendIcon(tendencia: string): string {
    if (tendencia === 'subida') return 'trending_up';
    if (tendencia === 'bajada') return 'trending_down';
    return 'trending_flat';
  }

  private formatDate(date: Date): string {
    return date ? date.toISOString().split('T')[0] : '';
  }

  sendEmail() {
    if (this.reportForm.invalid) return;
    this.generating = true;
    const { empresa_id, fechaInicio, fechaFin } = this.reportForm.value;

    this.reportsService
      .sendReportEmail(
        empresa_id,
        this.formatDate(fechaInicio),
        this.formatDate(fechaFin),
      )
      .subscribe({
        next: () => {
          this.toast.success('Reporte enviado por correo');
          this.generating = false;
        },
        error: (err: any) => {
          console.log(err);

          if (err && err.status == 400 && err.error.message) {
            this.toast.warning(err.error.message);
          } else {
            this.toast.error('Error enviando correo');
          }

          this.generating = false;
        },
      });
  }

  downloadFile(formato: 'PDF' | 'CSV') {
    if (this.reportForm.invalid) return;
    this.generating = true;
    const { empresa_id, fechaInicio, fechaFin } = this.reportForm.value;

    this.reportsService
      .downloadReport(
        empresa_id,
        formato,
        this.formatDate(fechaInicio),
        this.formatDate(fechaFin),
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_${new Date().getTime()}.${formato.toLowerCase()}`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toast.success(`Reporte ${formato} descargado`);
          this.generating = false;
        },
        error: () => {
          this.toast.error('Error descargando archivo');
          this.generating = false;
        },
      });
  }
}
