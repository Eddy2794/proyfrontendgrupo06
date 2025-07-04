import { Component, OnInit } from '@angular/core';
import { 
  RowComponent, 
  ColComponent, 
  TextColorDirective, 
  CardComponent, 
  CardHeaderComponent, 
  CardBodyComponent,
  ButtonDirective,
  TableDirective,
  BadgeComponent,
  AlertComponent,
  SpinnerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormSelectDirective,
  TooltipDirective,
  ContainerComponent

} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ColorModeService } from '@coreui/angular';
import { Router, RouterModule } from '@angular/router';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';


@Component({
  selector: 'app-categoria',
  standalone: true,
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
    ButtonDirective,
    TableDirective,
    BadgeComponent,
    AlertComponent,
    SpinnerComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormSelectDirective,
    TooltipDirective,
    IconDirective,
    ContainerComponent
  ],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})
export class CategoriaComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  loading = false;
  
  // Filtros y búsqueda
  searchTerm: string = '';
  filtroEstado?: string; // undefined, 'activa', 'inactiva'
  filtroNivel?: string; // undefined, 'PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Búsqueda con debounce
  private searchSubject = new Subject<string>();
  
  // Mensajes de feedback
  successMessage: string = '';
  errorMessage: string = '';
  
  // Opciones para filtros
  nivelesDisponibles = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
  
  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private colorModeService: ColorModeService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategorias();
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.currentPage = 1;
      this.aplicarFiltros();
    });
  }

  loadCategorias(): void {
    this.loading = true;
    this.clearMessages();
    
    this.categoriaService.getCategorias().subscribe({
      next: result => {
        if (result.success) {
          this.categorias = result.data.categorias || [];
          this.totalItems = this.categorias.length;
          this.aplicarFiltros();
        } else {
          this.notificationService.showError('Error', 'No se pudieron cargar las categorías');
        }
        this.loading = false;
      },
      error: error => {
        console.error('Error al cargar categorías:', error);
        this.notificationService.showError('Error', 'Error al cargar las categorías. Por favor, intente nuevamente.');
        this.loading = false;
      }
    });
  }
  
  // Métodos para filtros y búsqueda
  aplicarFiltros(): void {
    let categoriasFiltradas = [...this.categorias];
    
    // Filtro por término de búsqueda
    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      categoriasFiltradas = categoriasFiltradas.filter(categoria => 
        categoria.nombre?.toLowerCase().includes(termino) ||
        (categoria.descripcion && categoria.descripcion.toLowerCase().includes(termino)) ||
        (categoria.nivel && categoria.nivel.toLowerCase().includes(termino))
      );
    }
    
    // Filtro por estado
    if (this.filtroEstado) {
      const activa = this.filtroEstado === 'activa';
      categoriasFiltradas = categoriasFiltradas.filter(categoria => 
        (categoria.activa !== undefined ? categoria.activa : categoria.estado === 'ACTIVA') === activa
      );
    }
    
    // Filtro por nivel
    if (this.filtroNivel) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.nivel === this.filtroNivel);
    }
    
    // Aplicar paginación
    this.totalItems = categoriasFiltradas.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.categoriasFiltradas = categoriasFiltradas.slice(startIndex, endIndex);
  }
  
  onSearch(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(this.searchTerm);
  }
  
  onFiltroEstadoChange(value: string | undefined): void {
    this.filtroEstado = value;
    this.currentPage = 1;
    this.aplicarFiltros();
  }
  
  onFiltroNivelChange(value: string | undefined): void {
    this.filtroNivel = value;
    this.currentPage = 1;
    this.aplicarFiltros();
  }
  
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = undefined;
    this.filtroNivel = undefined;
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  // Métodos de paginación
  onPageChange(page: number): void {
    this.currentPage = page;
    this.aplicarFiltros();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedItems(): Categoria[] {
    return this.categoriasFiltradas;
  }
  
  // Métodos para mensajes
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Navegación
  agregarCategoria(): void {
    this.router.navigate(['/categoria-form', '0']);
  }

  editarCategoria(categoria: Categoria): void {
    this.router.navigate(['/categoria-form', categoria._id]);
  }

  // Confirmación y eliminación
  confirmarEliminacion(categoria: Categoria): void {
    if (confirm(`¿Está seguro que desea eliminar la categoría "${categoria.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      this.eliminarCategoria(categoria);
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    this.loading = true;
    this.categoriaService.deleteCategoria(categoria._id!).subscribe({
      next: result => {
        if (result.success) {
          this.notificationService.showSuccess('Éxito', 'Categoría eliminada correctamente');
          this.loadCategorias();
        } else {
          this.notificationService.showError('Error', 'No se pudo eliminar la categoría');
        }
        this.loading = false;
      },
      error: error => {
        console.error('Error al eliminar categoría:', error);
        this.notificationService.showError('Error', 'Error al eliminar la categoría. Por favor, intente nuevamente.');
        this.loading = false;
      }
    });
  }

  // Cambio de estado
  cambiarEstadoCategoria(categoria: Categoria, nuevoEstado: boolean): void {
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    this.loading = true;
    const servicio = nuevoEstado ?
      this.categoriaService.activateCategoria(categoria._id!) :
      this.categoriaService.deactivateCategoria(categoria._id!);

    servicio.subscribe({
      next: result => {
        if (result.success) {
          this.notificationService.showSuccess('Éxito', `Categoría ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`);
          this.loadCategorias();
        } else {
          this.notificationService.showError('Error', `No se pudo ${accion} la categoría`);
        }
        this.loading = false;
      },
      error: error => {
        console.error(`Error al ${accion} categoría:`, error);
        this.notificationService.showError('Error', `Error al ${accion} la categoría. Por favor, intente nuevamente.`);
        this.loading = false;
      }
    });
  }
  
  // Métodos para UI
  getBadgeClass(categoria: Categoria): string {
    const activa = categoria.activa !== undefined ? categoria.activa : categoria.estado === 'ACTIVA';
    return activa ? 'success' : 'secondary';
  }

  getButtonText(categoria: Categoria): string {
    const activa = categoria.activa !== undefined ? categoria.activa : categoria.estado === 'ACTIVA';
    return activa ? 'Desactivar categoría' : 'Activar categoría';
  }

  getButtonIcon(categoria: Categoria): string {
    const activa = categoria.activa !== undefined ? categoria.activa : categoria.estado === 'ACTIVA';
    return activa ? 'cilX' : 'cilCheck';
  }

  trackByCategoria(index: number, categoria: Categoria): string {
    return categoria._id || index.toString();
  }

  formatSchedules(horarios: any[]): string {
    if (!horarios || horarios.length === 0) {
      return 'Sin horarios';
    }
    return horarios.map(h => `${h.dia}: ${h.hora_inicio}-${h.hora_fin}`).join(', ');
  }

  formatAgeRange(categoria: Categoria): string {
    const edadMin = categoria.edad_min !== undefined ? categoria.edad_min : categoria.edadMinima;
    const edadMax = categoria.edad_max !== undefined ? categoria.edad_max : categoria.edadMaxima;
    return `${edadMin}-${edadMax} años`;
  }

  getLevelBadgeColor(nivel: string | undefined): string {
    if (!nivel) return 'secondary';
    const colors: { [key: string]: string } = {
      'PRINCIPIANTE': 'success',
      'INTERMEDIO': 'warning', 
      'AVANZADO': 'danger',
      'COMPETITIVO': 'dark'
    };
    return colors[nivel] || 'secondary';
  }

  getOccupancyPercentage(categoria: any): number {
    const current = categoria.alumnos_actuales || categoria.alumnosActuales || 0;
    const max = categoria.max_alumnos || categoria.cupoMaximo || 1;
    return max > 0 ? (current / max) * 100 : 0;
  }

  getEstadoActivo(categoria: any): boolean {
    return categoria.activa !== undefined ? categoria.activa : categoria.estado === 'ACTIVA';
  }

  getEstadoText(categoria: any): string {
    return this.getEstadoActivo(categoria) ? 'Activa' : 'Inactiva';
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }

}