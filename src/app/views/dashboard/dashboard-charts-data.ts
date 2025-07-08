import { Injectable, inject } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, ChartType, PluginOptionsByType, ScaleOptions, TooltipLabelStyle } from 'chart.js';
import { DeepPartial } from './utils';
import { getStyle } from '@coreui/utils';
import { AlumnoCategoriaService, AlumnoCategoriaStats } from '../../services/alumno-categoria.service';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  private alumnoCategoriaService = inject(AlumnoCategoriaService);
  
  constructor() {
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'Month') {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = `rgba(${getStyle('--cui-info-rgb')}, .1)`
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    // Obtener datos reales del servicio
    const periodMap: { [key: string]: 'day' | 'month' | 'year' } = {
      'Day': 'day',
      'Month': 'month',
      'Year': 'year'
    };

    this.alumnoCategoriaService.getInscripcionesStats(periodMap[period] || 'month').subscribe({
      next: (stats: AlumnoCategoriaStats) => {
        this.updateChartWithRealData(stats, period, brandSuccess, brandInfo, brandInfoBg, brandDanger);
      },
      error: (error: any) => {
        console.error('Error al obtener estadísticas:', error);
        // Fallback a datos de ejemplo en caso de error
        this.initChartWithFallbackData(period, brandSuccess, brandInfo, brandInfoBg, brandDanger);
      }
    });
  }

  private updateChartWithRealData(stats: AlumnoCategoriaStats, period: string, brandSuccess: string, brandInfo: string, brandInfoBg: string, brandDanger: string) {
    let labels: string[] = [];
    let datasets: ChartDataset[] = [];

    if (period === 'Day') {
      labels = (stats.inscripcionesPorDia ?? []).map((item: any) => item.fecha);
      
      // Crear dataset por cada categoría
      (stats.categorias ?? []).forEach((categoria: any, index: number) => {
        const categoriaData = (stats.inscripcionesPorDia ?? []).map(() => {
          // Calcular inscripciones por día para esta categoría específica
          return this.random(0, 20); // Por ahora usamos datos aleatorios, se puede mejorar con datos reales
        });
        
        datasets.push({
          data: categoriaData,
          label: categoria.nombre,
          backgroundColor: index === 0 ? brandInfoBg : 'transparent',
          borderColor: categoria.color || this.getCategoryColor(index),
          pointHoverBackgroundColor: categoria.color || this.getCategoryColor(index),
          borderWidth: 2,
          fill: index === 0
        });
      });
    } else if (period === 'Month') {
      labels = (stats.inscripcionesPorMes ?? []).map((item: any) => this.getShortMonthName(item.mes));
      datasets = [
        {
          data: (stats.inscripcionesPorMes ?? []).map((item: any) => item.cantidad),
          label: 'Inscripciones',
          backgroundColor: brandInfoBg,
          borderColor: brandInfo,
          pointHoverBackgroundColor: brandInfo,
          borderWidth: 2,
          fill: true
        }
      ];
    } else { // Year
      labels = (stats.inscripcionesPorAno ?? []).map((item: any) => item.ano);
      
      // Crear dataset por cada categoría
      (stats.categorias ?? []).forEach((categoria: any, index: number) => {
        const categoriaData = (stats.inscripcionesPorAno ?? []).map(() => {
          // Calcular inscripciones por año para esta categoría específica
          return this.random(50, 300); // Por ahora usamos datos aleatorios
        });
        
        datasets.push({
          data: categoriaData,
          label: categoria.nombre,
          backgroundColor: index === 0 ? brandInfoBg : 'transparent',
          borderColor: categoria.color || this.getCategoryColor(index),
          pointHoverBackgroundColor: categoria.color || this.getCategoryColor(index),
          borderWidth: 2,
          fill: index === 0
        });
      });
    }

    const plugins: DeepPartial<PluginOptionsByType<any>> = {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle),
          title: (tooltipItems) => {
            const periodLabels: { [key: string]: string } = {
              'Day': 'Día',
              'Month': 'Mes',
              'Year': 'Año'
            };
            return `${periodLabels[period] || 'Período'}: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} alumnos inscritos`;
          }
        }
      }
    };

    const scales = this.getScales();

    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 4,
          hitRadius: 10,
          hoverRadius: 6,
          hoverBorderWidth: 3
        }
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
  }

  private initChartWithFallbackData(period: string, brandSuccess: string, brandInfo: string, brandInfoBg: string, brandDanger: string) {
    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['Data1'] = [];
    this.mainChart['Data2'] = [];
    this.mainChart['Data3'] = [];

    // generate random values for mainChart
    for (let i = 0; i <= this.mainChart['elements']; i++) {
      this.mainChart['Data1'].push(this.random(50, 240));
      this.mainChart['Data2'].push(this.random(20, 160));
      this.mainChart['Data3'].push(65);
    }

    let labels: string[] = [];
    if (period === 'Month') {
      labels = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
    } else {
      const week = [
        'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'
      ];
      labels = week.concat(week, week, week);
    }

    const colors = [
      {
        // brandInfo
        backgroundColor: brandInfoBg,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        fill: true
      },
      {
        // brandSuccess
        backgroundColor: 'transparent',
        borderColor: brandSuccess || '#4dbd74',
        pointHoverBackgroundColor: '#fff'
      },
      {
        // brandDanger
        backgroundColor: 'transparent',
        borderColor: brandDanger || '#f86c6b',
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5]
      }
    ];

    const datasets: ChartDataset[] = [
      {
        data: this.mainChart['Data1'],
        label: 'Inscripciones Actuales',
        ...colors[0]
      },
      {
        data: this.mainChart['Data2'],
        label: 'Período Anterior',
        ...colors[1]
      },
      {
        data: this.mainChart['Data3'],
        label: 'Meta',
        ...colors[2]
      }
    ];

    const plugins: DeepPartial<PluginOptionsByType<any>> = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };

    const scales = this.getScales();

    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
        }
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
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

  private getShortMonthName(monthName: string): string {
    const monthMap: { [key: string]: string } = {
      'Enero': 'Ene',
      'Febrero': 'Feb',
      'Marzo': 'Mar',
      'Abril': 'Abr',
      'Mayo': 'May',
      'Junio': 'Jun',
      'Julio': 'Jul',
      'Agosto': 'Ago',
      'Septiembre': 'Sep',
      'Octubre': 'Oct',
      'Noviembre': 'Nov',
      'Diciembre': 'Dic'
    };
    return monthMap[monthName] || monthName.substring(0, 3);
  }

  getScales() {
    const colorBorderTranslucent = getStyle('--cui-border-color-translucent');
    const colorBody = getStyle('--cui-body-color');

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        max: 250,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5)
        }
      }
    };
    return scales;
  }
}
