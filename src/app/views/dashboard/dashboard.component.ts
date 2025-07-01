import { NgStyle, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, DOCUMENT, effect, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';

import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { AlumnoCategoriaService, AlumnoCategoriaStats } from '../../services/alumno-categoria.service';

interface IInscripcionData {
  categoria: string;
  totalAlumnos: number;
  porcentaje: number;
  color: string;
  tendencia: 'up' | 'down' | 'stable';
  cambio: number;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [WidgetsDropdownComponent, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressComponent, 
    // WidgetsBrandComponent, 
    CardHeaderComponent, TableDirective, AvatarComponent, DecimalPipe]
})
export class DashboardComponent implements OnInit {

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);
  readonly #alumnoCategoriaService: AlumnoCategoriaService = inject(AlumnoCategoriaService);

  public inscripcionesData: IInscripcionData[] = [];
  public estadisticasGenerales = {
    totalInscripciones: 0,
    categoriasMasPopular: '',
    crecimientoMensual: 0,
    alumnosActivos: 0
  };

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Month')
  });

  ngOnInit(): void {
    this.initCharts();
    this.updateChartOnColorModeChange();
    this.loadInscripcionesData();
  }

  loadInscripcionesData(): void {
    this.#alumnoCategoriaService.getInscripcionesStats('month').subscribe({
      next: (stats: AlumnoCategoriaStats) => {
        this.updateDashboardData(stats);
      },
      error: (error: any) => {
        console.error('Error al cargar datos de inscripciones:', error);
        this.setFallbackData();
      }
    });
  }

  private updateDashboardData(stats: AlumnoCategoriaStats): void {
    // Actualizar estadísticas generales
    this.estadisticasGenerales.totalInscripciones = stats.totalInscripciones;
    this.estadisticasGenerales.categoriasMasPopular = stats.inscripcionesPorCategoria
      .sort((a: any, b: any) => b.cantidad - a.cantidad)[0]?.categoria || 'N/A';
    
    // Calcular crecimiento mensual (simulado)
    const ultimosMeses = stats.inscripcionesPorMes.slice(-2);
    if (ultimosMeses.length === 2) {
      const diferencia = ultimosMeses[1].cantidad - ultimosMeses[0].cantidad;
      this.estadisticasGenerales.crecimientoMensual = ultimosMeses[0].cantidad > 0 
        ? Math.round((diferencia / ultimosMeses[0].cantidad) * 100) 
        : 0;
    }

    this.estadisticasGenerales.alumnosActivos = stats.totalInscripciones;

    // Crear datos para las tarjetas de progreso
    const maxInscripciones = Math.max(...stats.inscripcionesPorCategoria.map((c: any) => c.cantidad), 1);
    
    this.inscripcionesData = stats.inscripcionesPorCategoria.map((cat: any, index: number) => ({
      categoria: cat.categoria,
      totalAlumnos: cat.cantidad,
      porcentaje: Math.round((cat.cantidad / maxInscripciones) * 100),
      color: stats.categorias[index]?.color || this.getCategoryColor(index),
      tendencia: Math.random() > 0.5 ? 'up' : 'down', // Simulado
      cambio: Math.floor(Math.random() * 20) + 1 // Simulado
    }));
  }

  private setFallbackData(): void {
    this.estadisticasGenerales = {
      totalInscripciones: 247,
      categoriasMasPopular: 'Karate Infantil',
      crecimientoMensual: 12,
      alumnosActivos: 189
    };

    this.inscripcionesData = [
      {
        categoria: 'Karate Infantil',
        totalAlumnos: 89,
        porcentaje: 100,
        color: '#20a8d8',
        tendencia: 'up',
        cambio: 12
      },
      {
        categoria: 'Karate Juvenil',
        totalAlumnos: 67,
        porcentaje: 75,
        color: '#4dbd74',
        tendencia: 'up',
        cambio: 8
      },
      {
        categoria: 'Karate Adultos',
        totalAlumnos: 54,
        porcentaje: 60,
        color: '#f86c6b',
        tendencia: 'down',
        cambio: -3
      },
      {
        categoria: 'Karate Avanzado',
        totalAlumnos: 37,
        porcentaje: 42,
        color: '#ffc107',
        tendencia: 'up',
        cambio: 5
      }
    ];
  }

  private getCategoryColor(index: number): string {
    const colors = [
      '#20a8d8', // info
      '#4dbd74', // success  
      '#f86c6b', // danger
      '#ffc107', // warning
      '#6610f2', // indigo
      '#6f42c1', // purple
      '#e83e8c', // pink
      '#fd7e14', // orange
      '#20c997', // teal
      '#17a2b8'  // cyan
    ];
    return colors[index % colors.length];
  }

  initCharts(): void {
    this.mainChartRef()?.stop();
    this.mainChart = this.#chartsData.mainChart;
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initMainChart(value);
    this.initCharts();
    
    // Recargar datos según el período seleccionado
    const periodMap: { [key: string]: 'day' | 'month' | 'year' } = {
      'Day': 'day',
      'Month': 'month',
      'Year': 'year'
    };
    
    this.#alumnoCategoriaService.getInscripcionesStats(periodMap[value] || 'month').subscribe({
      next: (stats: AlumnoCategoriaStats) => {
        this.updateDashboardData(stats);
      },
      error: (error: any) => {
        console.error('Error al actualizar datos:', error);
      }
    });
  }

  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  updateChartOnColorModeChange() {
    const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
      this.setChartStyles();
    });

    this.#destroyRef.onDestroy(() => {
      unListen();
    });
  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.mainChart.options };
        const scales = this.#chartsData.getScales();
        this.mainChartRef().options.scales = { ...options.scales, ...scales };
        this.mainChartRef().update();
      });
    }
  }
}
