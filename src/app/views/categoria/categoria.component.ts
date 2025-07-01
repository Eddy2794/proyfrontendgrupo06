import { Component, OnInit } from '@angular/core';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { 
  RowComponent, 
  ColComponent, 
  TextColorDirective, 
  CardComponent, 
  CardHeaderComponent, 
  CardBodyComponent,
  CardFooterComponent,
  ButtonDirective,
  TableDirective,
  BadgeComponent,
  AlertComponent,
  SpinnerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormSelectDirective,
  ProgressComponent,
  TooltipDirective,
  ContainerComponent,
  AvatarComponent,
  WidgetStatAComponent,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective,
  TemplateIdDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ColorModeService } from '@coreui/angular';
import { Router, RouterModule } from '@angular/router';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData } from 'chart.js';


@Component({
  selector: 'app-categoria',
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    RowComponent, 
    ColComponent, 
    TextColorDirective, 
    CardComponent, 
    CardHeaderComponent, 
    CardBodyComponent, 
    CardFooterComponent,
    ChartjsComponent,
    ButtonDirective,
    TableDirective,
    BadgeComponent,
    AlertComponent,
    SpinnerComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormSelectDirective,
    ProgressComponent,
    TooltipDirective,
    IconDirective,
    ContainerComponent,
    AvatarComponent,
    WidgetStatAComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    TemplateIdDirective
  ],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})
export class CategoriaComponent implements OnInit {
  barChartData: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Alumnos por Categoría',
        backgroundColor: '#f87979',
        data: []
      }
    ]
  };

  pieChartData: ChartData = {
    labels: ['Activas', 'Inactivas'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384']
      }
    ]
  };

  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  loading = false;
  
  // Filtros y búsqueda
  searchTerm: string = '';
  filtroEstado: string = 'todas'; // 'todas', 'activas', 'inactivas'
  filtroNivel: string = 'todos'; // 'todos', 'PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'
  filtroEdadMin: number | null = null;
  filtroEdadMax: number | null = null;
  
  // Mensajes de feedback
  successMessage: string = '';
  errorMessage: string = '';
  
  // Propiedades calculadas para optimización
  get totalCategorias(): number {
    return this.categorias.length;
  }
  
  get categoriasActivas(): number {
    return this.getCategoriesActiveCount();
  }
  
  get ocupacionPromedio(): number {
    return this.getAverageOccupancy();
  }
  
  get totalEstudiantes(): number {
    return this.getTotalStudents();
  }
  
  get capacidadTotal(): number {
    return this.getTotalCapacity();
  }
  
  get ingresosMensuales(): number {
    return this.getTotalMonthlyRevenue();
  }
  
  // Opciones para filtros
  nivelesDisponibles = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
  
  // Iconos para los widgets y acciones
  icons = {
    cilArrowTop: 'cil-arrow-top',
    cilOptions: 'cil-options',
    cilToggleOn: 'cil-toggle-on',
    cilToggleOff: 'cil-toggle-off'
  };
  
  // Datos para gráficos de widgets
  revenueChartData: ChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      data: [65, 59, 84, 84, 51, 55],
      borderColor: '#321fdb',
      backgroundColor: 'rgba(50, 31, 219, 0.1)',
      borderWidth: 2,
      fill: true
    }]
  };
  
  occupancyChartData: ChartData = {
    labels: ['Ocupado', 'Disponible'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#2eb85c', '#e55353'],
      borderWidth: 0
    }]
  };
  
  // Configuración de gráficos mejorada
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const
      }
    }
  };
  
  miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  };

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private colorModeService: ColorModeService
  ) { }

  ngOnInit(): void {
    this.getCategorias();
    this.aplicarFiltros();
  }

  getCategorias() {
    this.loading = true;
    this.clearMessages();
    
    this.categoriaService.getCategorias().subscribe({
      next: result => {
        if (result.success) {
          this.categorias = result.data.categorias || [];
          this.aplicarFiltros();
          this.updateChartData();
        } else {
          this.showError('No se pudieron cargar las categorías');
        }
        this.loading = false;
      },
      error: error => {
        console.error('Error al cargar categorías:', error);
        this.showError('Error al cargar las categorías. Por favor, intente nuevamente.');
        this.loading = false;
      }
    });
  }
  
  // Métodos para filtros y búsqueda
  aplicarFiltros() {
    let categoriasFiltradas = [...this.categorias];
    
    // Filtro por término de búsqueda
    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      categoriasFiltradas = categoriasFiltradas.filter(categoria => 
        categoria.nombre.toLowerCase().includes(termino) ||
        (categoria.descripcion && categoria.descripcion.toLowerCase().includes(termino)) ||
        categoria.nivel.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por estado
    if (this.filtroEstado !== 'todas') {
      const activa = this.filtroEstado === 'activas';
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.activa === activa);
    }
    
    // Filtro por nivel
    if (this.filtroNivel !== 'todos') {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.nivel === this.filtroNivel);
    }
    
    // Filtro por edad mínima
    if (this.filtroEdadMin !== null) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.edad_min >= this.filtroEdadMin!);
    }
    
    // Filtro por edad máxima
    if (this.filtroEdadMax !== null) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.edad_max <= this.filtroEdadMax!);
    }
    
    this.categoriasFiltradas = categoriasFiltradas;
  }
  
  onSearchChange() {
    this.aplicarFiltros();
  }
  
  onFiltroEstadoChange() {
    this.aplicarFiltros();
  }
  
  onFiltroNivelChange() {
    this.aplicarFiltros();
  }
  
  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroEstado = 'todas';
    this.filtroNivel = 'todos';
    this.filtroEdadMin = null;
    this.filtroEdadMax = null;
    this.aplicarFiltros();
  }

  onFiltroEdadChange(): void {
    this.aplicarFiltros();
  }

  getFiltrosActivos(): string[] {
    const filtros: string[] = [];
    
    if (this.searchTerm) {
      filtros.push(`Búsqueda: "${this.searchTerm}"`);
    }
    
    if (this.filtroEstado !== 'todas') {
      filtros.push(`Estado: ${this.filtroEstado === 'activas' ? 'Activas' : 'Inactivas'}`);
    }
    
    if (this.filtroNivel !== 'todos') {
      filtros.push(`Nivel: ${this.filtroNivel}`);
    }
    
    if (this.filtroEdadMin !== null) {
      filtros.push(`Edad mín: ${this.filtroEdadMin}`);
    }
    
    if (this.filtroEdadMax !== null) {
      filtros.push(`Edad máx: ${this.filtroEdadMax}`);
    }
    
    return filtros;
  }

  quitarFiltro(filtro: string): void {
    if (filtro.startsWith('Búsqueda:')) {
      this.searchTerm = '';
    } else if (filtro.startsWith('Estado:')) {
      this.filtroEstado = 'todas';
    } else if (filtro.startsWith('Nivel:')) {
      this.filtroNivel = 'todos';
    } else if (filtro.startsWith('Edad mín:')) {
      this.filtroEdadMin = null;
    } else if (filtro.startsWith('Edad máx:')) {
      this.filtroEdadMax = null;
    }
    
    this.aplicarFiltros();
  }
  
  // Métodos para mensajes
  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }
  
  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }
  
  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  agregarCategoria() {
    this.router.navigate(['/categoria-form', '0']);
  }

  modificarCategoria(categoria: Categoria) {
    this.router.navigate(['/categoria-form', categoria._id]);
  }

  eliminarCategoria(categoria: Categoria) {
    if (confirm(`¿Está seguro que desea eliminar la categoría "${categoria.nombre}"?`)) {
      this.loading = true;
      this.categoriaService.deleteCategoria(categoria._id!).subscribe({
        next: result => {
          if (result.success) {
            this.showSuccess('Categoría eliminada exitosamente');
            this.getCategorias();
          } else {
            this.showError('Error al eliminar la categoría');
          }
          this.loading = false;
        },
        error: error => {
          console.error('Error al eliminar categoría:', error);
          this.showError('Error al eliminar la categoría. Por favor, intente nuevamente.');
          this.loading = false;
        }
      });
    }
  }

  toggleEstadoCategoria(categoria: Categoria) {
    const accion = categoria.activa ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro que desea ${accion} la categoría "${categoria.nombre}"?`)) {
      this.loading = true;
      const servicio = categoria.activa ?
        this.categoriaService.deactivateCategoria(categoria._id!) :
        this.categoriaService.activateCategoria(categoria._id!);

      servicio.subscribe({
        next: result => {
          if (result.success) {
            this.showSuccess(`Categoría ${accion === 'activar' ? 'activada' : 'desactivada'} exitosamente`);
            this.getCategorias();
          } else {
            this.showError(`Error al ${accion} la categoría`);
          }
          this.loading = false;
        },
        error: error => {
          console.error(`Error al ${accion} categoría:`, error);
          this.showError(`Error al ${accion} la categoría. Por favor, intente nuevamente.`);
          this.loading = false;
        }
      });
    }
  }
  
  // Métodos auxiliares para la UI
  getBadgeClass(activa: boolean): string {
    return activa ? 'success' : 'secondary';
  }
  
  getBadgeText(activa: boolean): string {
    return activa ? 'Activa' : 'Inactiva';
  }
  
  getButtonClass(activa: boolean): string {
    return activa ? 'warning' : 'success';
  }
  
  getButtonText(activa: boolean): string {
    return activa ? 'Desactivar' : 'Activar';
  }
  
  getButtonIcon(activa: boolean): string {
    return activa ? this.icons.cilToggleOn : this.icons.cilToggleOff;
  }
  
  // Getter para detectar el tema actual
  get isDarkTheme(): boolean {
    return this.colorModeService.colorMode() === 'dark';
  }
  
  // Método para mejorar el rendimiento de la tabla
  trackByCategoria(index: number, categoria: Categoria): string {
    return categoria._id || index.toString();
  }

  formatearHorarios(horarios: any[]): string {
    if (!horarios || horarios.length === 0) {
      return 'Sin horarios';
    }
    return horarios.map(h => `${h.dia}: ${h.hora_inicio}-${h.hora_fin}`).join(', ');
  }

  getRangoEdad(categoria: Categoria): string {
    return `${categoria.edad_min} - ${categoria.edad_max} años`;
  }

  // Nuevos métodos para la tabla mejorada
  getNivelBadgeColor(nivel: string): string {
    switch (nivel.toUpperCase()) {
      case 'PRINCIPIANTE':
        return 'success';
      case 'INTERMEDIO':
        return 'warning';
      case 'AVANZADO':
        return 'info';
      case 'COMPETITIVO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getProgressColor(alumnosActuales: number, maxAlumnos: number): string {
    const porcentaje = (alumnosActuales / maxAlumnos) * 100;
    if (porcentaje >= 90) {
      return 'danger';
    } else if (porcentaje >= 70) {
      return 'warning';
    } else if (porcentaje >= 50) {
      return 'info';
    } else {
      return 'success';
    }
  }

  // Métodos para widgets de métricas
  getCategoriesActiveCount(): number {
    return this.categorias.filter(c => c.activa).length;
  }

  getAverageOccupancy(): number {
    if (this.categorias.length === 0) return 0;
    const totalOccupancy = this.categorias.reduce((sum, c) => {
      return sum + (c.alumnos_actuales / c.max_alumnos) * 100;
    }, 0);
    return Math.round(totalOccupancy / this.categorias.length);
  }

  getTotalMonthlyRevenue(): number {
    return this.categorias
      .filter(c => c.activa)
      .reduce((sum, c) => sum + (c.cuota_mensual * c.alumnos_actuales), 0);
  }

  getRevenueGrowthPercentage(): string {
    // Simulamos un crecimiento basado en la ocupación promedio
    const occupancy = this.getAverageOccupancy();
    const growth = occupancy > 75 ? '+12.5' : occupancy > 50 ? '+8.3' : '+4.1';
    return growth;
  }

  updateWidgetCharts(): void {
    // Actualizar datos del gráfico de ocupación
    const totalStudents = this.getTotalStudents();
    const totalCapacity = this.getTotalCapacity();
    const available = totalCapacity - totalStudents;
    
    this.occupancyChartData = {
      ...this.occupancyChartData,
      datasets: [{
        data: [totalStudents, available],
        backgroundColor: ['#2eb85c', '#e55353'],
        borderWidth: 0
      }]
    };

    // Actualizar datos del gráfico de ingresos (simulado)
    const monthlyRevenue = this.getTotalMonthlyRevenue();
    const baseRevenue = monthlyRevenue * 0.8;
    const revenueData = [
      baseRevenue * 0.9,
      baseRevenue * 0.95,
      baseRevenue * 1.1,
      baseRevenue * 1.05,
      baseRevenue * 0.98,
      monthlyRevenue
    ];
    
    this.revenueChartData = {
      ...this.revenueChartData,
      datasets: [{
        data: revenueData,
        borderColor: '#321fdb',
        backgroundColor: 'rgba(50, 31, 219, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  getTotalStudents(): number {
    return this.categorias.reduce((sum, c) => sum + c.alumnos_actuales, 0);
  }

  getTotalCapacity(): number {
    return this.categorias.reduce((sum, c) => sum + c.max_alumnos, 0);
  }

  getCategoriesByLevel(nivel: string): number {
    return this.categorias.filter(c => c.nivel === nivel).length;
  }

  getAverageMonthlyFee(): number {
    if (this.categorias.length === 0) return 0;
    const totalFees = this.categorias.reduce((sum, c) => sum + c.cuota_mensual, 0);
    return totalFees / this.categorias.length;
  }

  getMinAge(): number {
    if (this.categorias.length === 0) return 0;
    return Math.min(...this.categorias.map(c => c.edad_min));
  }

  getMaxAge(): number {
    if (this.categorias.length === 0) return 0;
    return Math.max(...this.categorias.map(c => c.edad_max));
  }

  private updateChartData(): void {
    const labels = this.categorias.map(c => c.nombre);
    const data = this.categorias.map(c => c.alumnos_actuales);
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Alumnos por Categoría',
          backgroundColor: '#f87979',
          data: data
        }
      ]
    };

    const activas = this.categorias.filter(c => c.activa).length;
    const inactivas = this.categorias.length - activas;
    this.pieChartData = {
      labels: ['Activas', 'Inactivas'],
      datasets: [
        {
          data: [activas, inactivas],
          backgroundColor: ['#36A2EB', '#FF6384'],
          hoverBackgroundColor: ['#36A2EB', '#FF6384']
        }
      ]
    };
    
    // Actualizar los gráficos de los widgets
    this.updateWidgetCharts();
  }
}