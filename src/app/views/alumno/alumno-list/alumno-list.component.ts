import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// CoreUI Components
import { 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  SpinnerComponent,
  AlertComponent,
  BadgeComponent,
  RowComponent,
  ColComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
  TableDirective,
  PaginationComponent,
  PageItemComponent,
  PageLinkDirective,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// Models and Services
import { Alumno, AlumnoModel, ESTADOS_ALUMNO } from '../../../models/alumno.model';
import { AlumnoService } from '../../../services/alumno.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { CategoriaService } from '../../../services/categoria.service';
import { User, UserModel } from '../../../models/user.model';
import { Categoria } from '../../../models/categoria';
import { AlumnoDetalleModalComponent } from '../alumno-detalle-modal.component';

@Component({
  standalone: true,
  selector: 'app-alumno-list',
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    SpinnerComponent,
    AlertComponent,
    BadgeComponent,
    RowComponent,
    ColComponent,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    ButtonDirective,
    TableDirective,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    TooltipDirective,
    IconDirective,
    AlumnoDetalleModalComponent
  ],
  templateUrl: './alumno-list.component.html',
  styleUrls: ['./alumno-list.component.scss']
})
export class AlumnoListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Datos principales
  alumnos: AlumnoModel[] = [];
  filteredAlumnos: AlumnoModel[] = [];
  loading = false;
  error: string | null = null;

  // Búsqueda y filtros
  searchTerm: string = '';
  selectedStatus: string | undefined = 'ACTIVO';
  selectedTutor: string | undefined;
  selectedCategoria: string | undefined;

  // Datos para filtros
  tutores: UserModel[] = [];
  categorias: Categoria[] = [];
  alumnoStates = ESTADOS_ALUMNO.map(estado => estado.value);

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  alumnoSeleccionado: Alumno | null = null;
  mostrarModalDetalle: boolean = false;

  constructor(
    private alumnoService: AlumnoService,
    private userService: UserService,
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applyFilters();
    this.loadTutores();
    this.loadCategorias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

    /**
   * Cargar lista de alumnos
   */
  loadAlumnos(): void {
    this.loading = true;
    this.error = null;

    // Usar el método con paginación y filtros del servidor
    this.alumnoService.getAllAlumnos({}, this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // La respuesta del backend tiene estructura: { alumnos: [...], pagination: {...} }
            const alumnosData = response.data.alumnos || response.data || [];
            this.alumnos = alumnosData.map((alumno: any) => AlumnoModel.fromJSON(alumno));
            this.filteredAlumnos = [...this.alumnos];
            
            // Si hay paginación, usar esos datos
            if (response.data.pagination) {
              this.totalItems = response.data.pagination.total;
              this.totalPages = response.data.pagination.pages;
            } else {
              this.totalItems = this.alumnos.length;
              this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            }
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar la lista de alumnos: ' + (error.error?.message || error.message);
          this.notificationService.showError('Error al cargar alumnos');
          this.loading = false;
        }
      });
  }

  /**
   * Cargar tutores para el filtro
   */
  loadTutores(): void {
    console.log('Iniciando carga de tutores...');
    // Usar el método específico para obtener usuarios por rol
    this.userService.getUsersByRole('TUTOR', 1, 999)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Respuesta de getUsersByRole:', response);
          if (response.success && response.data) {
            this.tutores = response.data.users.map((user: any) => UserModel.fromJSON(user));
            console.log('Tutores cargados:', this.tutores);
            console.log('Número de tutores:', this.tutores.length);
          } else {
            console.log('Respuesta no exitosa o sin datos');
            this.loadTutoresFallback();
          }
        },
        error: (error) => {
          console.error('Error al cargar tutores:', error);
          // Fallback: intentar con getAllUsers y filtrar
          this.loadTutoresFallback();
        }
      });
  }

  /**
   * Método fallback para cargar tutores
   */
  loadTutoresFallback(): void {
    console.log('Intentando carga de tutores con fallback...');
    this.userService.getAllUsers(1, 999)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Respuesta de getAllUsers:', response);
          if (response.success && response.data) {
            const todosLosUsuarios = response.data.users || [];
            console.log('Todos los usuarios:', todosLosUsuarios);
            
            const usuariosTutor = todosLosUsuarios.filter((user: any) => user.rol === 'TUTOR');
            console.log('Usuarios con rol TUTOR:', usuariosTutor);
            
            this.tutores = usuariosTutor.map((user: any) => UserModel.fromJSON(user));
            console.log('Tutores cargados (fallback):', this.tutores);
            console.log('Número de tutores (fallback):', this.tutores.length);
          }
        },
        error: (error) => {
          console.error('Error al cargar tutores (fallback):', error);
        }
      });
  }

  /**
   * Cargar categorías para el filtro
   */
  loadCategorias(): void {
    this.categoriaService.getCategorias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.categorias = response.data.categorias || [];
          }
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
        }
      });
  }

  /**
   * Aplicar filtros y búsqueda
   */
  applyFilters(): void {
    // Si hay filtros activos, hacer consulta al servidor
    if (this.searchTerm || this.selectedStatus || this.selectedTutor || this.selectedCategoria) {
      this.currentPage = 1; // Resetear a primera página
      this.loadAlumnosWithFilters();
    } else {
      // Si no hay filtros, cargar todos los alumnos
      this.loadAlumnos();
    }
  }

  /**
   * Cargar alumnos con filtros aplicados
   */
  loadAlumnosWithFilters(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {};
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.selectedStatus) filters.estado = this.selectedStatus;
    if (this.selectedTutor) filters.tutor_id = this.selectedTutor;
    if (this.selectedCategoria) filters.categoria_id = this.selectedCategoria;

    this.alumnoService.getAllAlumnos(filters, this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const alumnosData = response.data.alumnos || response.data || [];
            this.alumnos = alumnosData.map((alumno: any) => AlumnoModel.fromJSON(alumno));
            this.filteredAlumnos = [...this.alumnos];
            
            if (response.data.pagination) {
              this.totalItems = response.data.pagination.total;
              this.totalPages = response.data.pagination.pages;
            } else {
              this.totalItems = this.alumnos.length;
              this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            }
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar la lista de alumnos: ' + (error.error?.message || error.message);
          this.notificationService.showError('Error al cargar alumnos');
          this.loading = false;
        }
      });
  }

  /**
   * Búsqueda por número de socio
   */
  onSearch(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  /**
   * Filtro por estado
   */
  onStatusFilter(value: string | undefined): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  /**
   * Filtro por tutor
   */
  onTutorFilter(value: string | undefined): void {
    this.selectedTutor = value;
    this.applyFilters();
  }

  /**
   * Filtro por categoría
   */
  onCategoriaFilter(value: string | undefined): void {
    this.selectedCategoria = value;
    this.applyFilters();
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = undefined;
    this.selectedTutor = undefined;
    this.selectedCategoria = undefined;
    this.currentPage = 1; // Resetear a primera página
    this.loadAlumnos(); // Recargar datos sin filtros
  }

  /**
   * Cambiar página
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Si hay filtros activos, recargar con filtros
      if (this.searchTerm || this.selectedStatus || this.selectedTutor || this.selectedCategoria) {
        this.loadAlumnosWithFilters();
      } else {
        this.loadAlumnos();
      }
    }
  }

  /**
   * TrackBy para optimizar el rendimiento de la tabla
   */
  trackByAlumnoId(index: number, alumno: Alumno): string {
    return alumno._id || index.toString();
  }

  /**
   * Ir a crear nuevo alumno
   */
  onNuevoAlumno(): void {
    this.router.navigate(['/alumno/crear']);
  }

  /**
   * Ver detalle del alumno
   */
  onVerDetalle(alumno: Alumno): void {
    this.alumnoSeleccionado = alumno;
    this.mostrarModalDetalle = true;
  }

  /**
   * Editar alumno
   */
  onModificar(alumno: Alumno): void {
    if (alumno._id) {
      this.router.navigate(['/alumno/editar', alumno._id]);
    }
  }

  /**
   * Eliminar alumno
   */
  onEliminar(alumno: Alumno): void {
    if (!alumno._id) {
      this.notificationService.showError('ID de alumno no válido');
      return;
    }

    if (confirm(`¿Estás seguro de que querés eliminar al alumno ${alumno.numero_socio}?`)) {
      this.alumnoService.deleteAlumnoFisico(alumno._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess('Alumno eliminado correctamente');
              this.loadAlumnos(); // Recargar lista
            }
          },
          error: (error) => {
            this.notificationService.showError('Error al eliminar alumno: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  /**
   * Desactivar (soft delete) un alumno
   */
  onDesactivarAlumno(alumno: Alumno): void {
    if (!alumno._id) {
      this.notificationService.showError('ID de alumno no válido');
      return;
    }
    if (confirm(`¿Estás seguro de que querés desactivar al alumno ${alumno.numero_socio}?`)) {
      this.alumnoService.deleteAlumno(alumno._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess('Alumno desactivado correctamente');
              this.loadAlumnos();
            }
          },
          error: (error) => {
            this.notificationService.showError('Error al desactivar alumno: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  /**
   * Activar (restaurar) un alumno
   */
  onActivarAlumno(alumno: Alumno): void {
    if (!alumno._id) {
      this.notificationService.showError('ID de alumno no válido');
      return;
    }
    if (confirm(`¿Estás seguro de que querés activar al alumno ${alumno.numero_socio}?`)) {
      this.alumnoService.restoreAlumno(alumno._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess('Alumno activado correctamente. Ahora está en la lista de activos.');
              this.applyFilters();
            }
          },
          error: (error) => {
            this.notificationService.showError('Error al activar alumno: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  /**
   * Obtener nombre completo del alumno
   */
  getNombreCompleto(alumno: Alumno): string {
    const persona = typeof alumno.persona === 'object' ? alumno.persona : null;
    if (persona) {
      return `${persona.nombres || ''} ${persona.apellidos || ''}`.trim();
    }
    return 'N/A';
  }

  /**
   * Obtener nombre del tutor
   */
  getNombreTutor(alumno: Alumno): string {
    if (alumno.tutor && typeof alumno.tutor === 'object') {
      const tutor = alumno.tutor as any;
      return tutor.nombreCompleto || `${tutor.nombres || ''} ${tutor.apellidos || ''}`.trim();
    }
    return 'N/A';
  }

  /**
   * Obtener información del documento
   */
  getDocumentoInfo(alumno: Alumno): string {
    const persona = typeof alumno.persona === 'object' ? alumno.persona : null;
    if (persona) {
      return `${persona.tipoDocumento || 'N/A'}: ${persona.numeroDocumento || 'N/A'}`;
    }
    return 'N/A';
  }

  /**
   * Obtener username del tutor
   */
  getTutorUsername(alumno: Alumno): string {
    if (alumno.tutor && typeof alumno.tutor === 'object') {
      const tutor = alumno.tutor as any;
      return tutor.username || 'N/A';
    }
    return 'N/A';
  }

  /**
   * Obtener color del badge para el estado
   */
  getEstadoBadgeColor(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'secondary';
      case 'SUSPENDIDO':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  /**
   * Formatear fecha
   */
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const fecha = new Date(date);
    return fecha.toLocaleDateString('es-AR');
  }

  /**
   * Obtener nombre de la categoría
   */
  getNombreCategoria(alumno: Alumno): string {
    if (alumno.categoriaPrincipal && typeof alumno.categoriaPrincipal === 'object' && 'nombre' in alumno.categoriaPrincipal) {
      return alumno.categoriaPrincipal.nombre;
    }
    return 'N/A';
  }

  /**
   * Obtener rango de edad de la categoría
   */
  getRangoEdadCategoria(alumno: Alumno): string {
    if (alumno.categoriaPrincipal && typeof alumno.categoriaPrincipal === 'object' && 'edadMinima' in alumno.categoriaPrincipal && 'edadMaxima' in alumno.categoriaPrincipal) {
      return `${alumno.categoriaPrincipal.edadMinima}-${alumno.categoriaPrincipal.edadMaxima} años`;
    }
    return '';
  }
} 