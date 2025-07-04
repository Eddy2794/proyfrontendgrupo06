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
  ContainerComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalBodyComponent,
  ModalFooterComponent,
  ButtonCloseDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ColorModeService } from '@coreui/angular';
import { Router, RouterModule } from '@angular/router';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { ProfesorService } from '../../services/profesor.service';
import { AlumnoCategoriaService } from '../../services/alumno-categoria.service';
import { TorneoCategoriaService } from '../../services/torneo-categoria.service';
import { ProfesorCategoriaService } from '../../services/profesor-categoria.service';
// import { CategoriaDetalleModalComponent } from './categoria-detalle-modal.component'; // Removido - usando modal nativo de Core UI
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
    ContainerComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective
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
  
  // Modal de detalles
  modalDetallesVisible: boolean = false;
  categoriaSeleccionada: Categoria | null = null;
  detallesCategoria: any = null;
  loadingDetalles: boolean = false;
  
  // Modal de confirmación de eliminación
  modalEliminarVisible: boolean = false;
  categoriaAEliminar: Categoria | null = null;
  
  // Datos para el modal
  profesores: any[] = [];
  alumnosCategoria: any[] = [];
  torneosCategoria: any[] = [];
  
  // Relaciones profesor-categoría
  profesoresCategorias: any[] = [];
  
  constructor(
    private categoriaService: CategoriaService,
    private profesorService: ProfesorService,
    private alumnoCategoriaService: AlumnoCategoriaService,
    private torneoCategoriaService: TorneoCategoriaService,
    private profesorCategoriaService: ProfesorCategoriaService,
    private router: Router,
    private colorModeService: ColorModeService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategorias();
    this.cargarProfesores();
    this.cargarProfesoresCategorias();
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
          // Recargar relaciones profesor-categoría cuando se actualicen las categorías
          this.cargarProfesoresCategorias();
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
        categoria.estado === (activa ? 'ACTIVA' : 'INACTIVA')
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
    this.categoriaAEliminar = categoria;
    this.modalEliminarVisible = true;
  }
  
  cerrarModalEliminar(): void {
    this.modalEliminarVisible = false;
    this.categoriaAEliminar = null;
  }
  
  confirmarEliminarCategoria(): void {
    if (this.categoriaAEliminar) {
      this.eliminarCategoria(this.categoriaAEliminar);
      this.cerrarModalEliminar();
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
    const activa = categoria.estado === 'ACTIVA';
    return activa ? 'success' : 'secondary';
  }

  getButtonText(categoria: Categoria): string {
    const activa = categoria.estado === 'ACTIVA';
    return activa ? 'Desactivar categoría' : 'Activar categoría';
  }

  getButtonIcon(categoria: Categoria): string {
    const activa = categoria.estado === 'ACTIVA';
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
    const edadMin = categoria.edadMinima;
    const edadMax = categoria.edadMaxima;
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
    const max = categoria.cupoMaximo || 1;
    return max > 0 ? (current / max) * 100 : 0;
  }

  getEstadoActivo(categoria: any): boolean {
    return categoria.estado === 'ACTIVA';
  }

  getEstadoText(categoria: any): string {
    return this.getEstadoActivo(categoria) ? 'Activa' : 'Inactiva';
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }
  
  // Métodos para el modal de detalles
  abrirDetalles(categoria: Categoria) {
    this.categoriaSeleccionada = categoria;
    this.modalDetallesVisible = true;
    this.cargarDetallesCategoria(categoria._id!);
  }
  
  cerrarDetalles() {
    this.modalDetallesVisible = false;
    this.categoriaSeleccionada = null;
    this.detallesCategoria = null;
    this.alumnosCategoria = [];
    this.torneosCategoria = [];
  }
  
  onModalDetallesChange(visible: boolean) {
    if (!visible) {
      this.cerrarDetalles();
    }
  }
  
  onModalEliminarChange(visible: boolean) {
    if (!visible) {
      this.cerrarModalEliminar();
    }
  }
  
  cargarProfesores() {
    this.profesorService.getProfesoresActivos().subscribe({
      next: (profesores: any) => {
        this.profesores = profesores || [];
      },
      error: (error: any) => {
        console.error('Error al cargar profesores:', error);
      }
    });
  }
  
  cargarProfesoresCategorias() {
    this.profesorCategoriaService.getProfesorCategorias().subscribe({
      next: (response: any) => {
        // Asegurar que siempre sea un array
        if (Array.isArray(response)) {
          this.profesoresCategorias = response;
        } else if (response && Array.isArray(response.data)) {
          this.profesoresCategorias = response.data;
        } else {
          this.profesoresCategorias = [];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar relaciones profesor-categoría:', error);
        this.profesoresCategorias = []; // Asegurar que sea un array en caso de error
      }
    });
  }
  
  cargarDetallesCategoria(categoriaId: string) {
    this.loadingDetalles = true;
    
    // Cargar alumnos de la categoría
    this.alumnoCategoriaService.getAlumnosPorCategoria(categoriaId).subscribe({
      next: (response: any) => {
        this.alumnosCategoria = response.data || response || [];
        this.loadingDetalles = false;
      },
      error: (error: any) => {
        console.error('Error al cargar alumnos:', error);
        this.alumnosCategoria = [];
        this.loadingDetalles = false;
      }
    });
    
    // Cargar torneos de la categoría
    this.torneoCategoriaService.getTorneosPorCategoria(categoriaId).subscribe({
      next: (response: any) => {
        this.torneosCategoria = response.data || response || [];
      },
      error: (error: any) => {
        console.error('Error al cargar torneos:', error);
        this.torneosCategoria = [];
      }
    });
  }
  
  getNombreProfesor(categoriaId: string | undefined): string {
    if (!categoriaId) return 'Sin asignar';
    
    // Verificar que profesoresCategorias sea un array
    if (!Array.isArray(this.profesoresCategorias)) {
      return 'Sin asignar';
    }
    
    // Buscar la relación profesor-categoría activa para esta categoría
    const profesorCategoria = this.profesoresCategorias.find(pc => 
      pc.categoria?._id === categoriaId && pc.estado === 'ACTIVO'
    );
    
    if (!profesorCategoria) return 'Sin asignar';
    
    // Obtener el profesor desde la relación
    const profesor = profesorCategoria.profesor;
    if (!profesor) return 'Sin asignar';
    
    // Construir el nombre del profesor
    const nombres = profesor.persona?.nombres || profesor.personaData?.nombres || '';
    const apellidos = profesor.persona?.apellidos || profesor.personaData?.apellidos || '';
    
    return `${nombres} ${apellidos}`.trim() || 'Profesor no encontrado';
  }

}