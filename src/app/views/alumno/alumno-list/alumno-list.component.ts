import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  // Método auxiliar para obtener el nombre del alumno
  getNombreAlumno(alumno: any): string {
    const persona = typeof alumno?.persona === 'object' ? alumno.persona : null;
    if (persona) {
      return `${persona.nombres || ''} ${persona.apellidos || ''}`.trim();
    }
    return 'Alumno no identificado';
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

  /**
   * Exportar lista de alumnos a PDF
   */
  exportarAlumnosPDF(): void {
    if (this.filteredAlumnos.length === 0) {
      this.notificationService.showWarning('Advertencia', 'No hay alumnos para exportar');
      return;
    }

    const elementoTemporal = document.createElement('div');
    elementoTemporal.style.position = 'absolute';
    elementoTemporal.style.left = '-9999px';
    elementoTemporal.style.top = '0';
    elementoTemporal.style.backgroundColor = 'white';
    elementoTemporal.style.padding = '20px';
    elementoTemporal.style.width = '900px';

    const fechaActual = new Date().toLocaleDateString('es-ES');
    const horaActual = new Date().toLocaleTimeString('es-ES');

    // Calcular estadísticas
    const alumnosActivos = this.filteredAlumnos.filter(a => a.estado === 'ACTIVO').length;
    const alumnosInactivos = this.filteredAlumnos.filter(a => a.estado === 'INACTIVO').length;
    const alumnosSuspendidos = 0; // Los alumnos solo pueden estar ACTIVO o INACTIVO

    // Calcular distribución por género
    const generos = { masculino: 0, femenino: 0, otro: 0 };
    const edades: number[] = [];

    this.filteredAlumnos.forEach(alumno => {
      const persona = typeof alumno.persona === 'object' ? alumno.persona : null;
      if (persona?.genero) {
        if (persona.genero.toLowerCase() === 'masculino' || persona.genero.toLowerCase() === 'm') {
          generos.masculino++;
        } else if (persona.genero.toLowerCase() === 'femenino' || persona.genero.toLowerCase() === 'f') {
          generos.femenino++;
        } else {
          generos.otro++;
        }
      }

      if (persona?.fechaNacimiento) {
        const fechaNac = new Date(persona.fechaNacimiento);
        const edad = new Date().getFullYear() - fechaNac.getFullYear();
        edades.push(edad);
      }
    });

    const edadMinima = edades.length > 0 ? Math.min(...edades) : 0;
    const edadMaxima = edades.length > 0 ? Math.max(...edades) : 0;

    elementoTemporal.innerHTML = `
      <div style="font-family: Arial, sans-serif; background: white; padding: 20px; line-height: 1.4;">
        <!-- Header con logo prominente -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #28a745; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">9J</span>
            </div>
            <div>
              <h1 style="color: #28a745; margin: 0; font-size: 28px; font-weight: bold;">Club 9 de Julio</h1>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Institución Deportiva</p>
            </div>
          </div>
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Reporte General de Alumnos</h2>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Estadísticas -->
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h4 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 16px;">📊 Estadísticas Generales</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 12px; text-align: center;">
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #28a745;">${alumnosActivos}</div>
              <div>Activos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #dc3545;">${alumnosInactivos}</div>
              <div>Inactivos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #ffc107;">${alumnosSuspendidos}</div>
              <div>Suspendidos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #6f42c1;">${generos.masculino}M / ${generos.femenino}F</div>
              <div>Distribución</div>
            </div>
          </div>
        </div>
        
        <!-- Tabla detallada de alumnos -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #28a745; color: white;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">N° Socio</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Alumno</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">DNI</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Edad</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Categoría</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tutor</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">F. Inscripción</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredAlumnos.map((alumno, index) => {
              // Acceso robusto a los datos populados
              const persona = (alumno.persona_datos && typeof alumno.persona_datos === 'object') ? alumno.persona_datos : undefined;
              const categoria = (alumno.categoriaPrincipal && typeof alumno.categoriaPrincipal === 'object') ? alumno.categoriaPrincipal : undefined;
              const tutor = (alumno.tutor && typeof alumno.tutor === 'object') ? alumno.tutor : undefined;
              const tutorPersona = (tutor && tutor.persona && typeof tutor.persona === 'object') ? tutor.persona : undefined;

              // Nombre completo del alumno
              const nombreCompleto = (persona && persona.nombres && persona.apellidos)
                ? `${persona.nombres} ${persona.apellidos}`.trim()
                : 'N/A';

              // DNI
              const numeroDocumento = (persona && persona.numeroDocumento) ? persona.numeroDocumento : 'N/A';

              // Edad
              let edad = 'N/A';
              if (persona && persona.fechaNacimiento) {
                const fechaNac = new Date(persona.fechaNacimiento);
                const hoy = new Date();
                let edadCalculada = hoy.getFullYear() - fechaNac.getFullYear();
                const m = hoy.getMonth() - fechaNac.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
                  edadCalculada--;
                }
                edad = edadCalculada.toString();
              }

              // Categoría
              const nombreCategoria = (categoria && categoria.nombre) ? categoria.nombre : 'N/A';

              // Tutor (nombre completo o username)
              const nombreTutor = (tutorPersona && tutorPersona.nombres && tutorPersona.apellidos)
                ? `${tutorPersona.nombres} ${tutorPersona.apellidos}`.trim()
                : (tutor && tutor.username ? tutor.username : 'N/A');

              // Fecha de inscripción
              const fechaInscripcion = alumno.fecha_inscripcion
                ? new Date(alumno.fecha_inscripcion).toLocaleDateString('es-ES')
                : 'N/A';

              // Estado
              const estado = alumno.estado || 'N/A';

              // Número de socio
              const numeroSocio = alumno.numero_socio || 'N/A';

              return `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                  <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">
                    ${numeroSocio}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${nombreCompleto}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${numeroDocumento}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                    ${edad}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${nombreCategoria}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${nombreTutor}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${fechaInscripcion}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                    <span style="padding: 2px 6px; border-radius: 3px; font-size: 9px; color: white; background: ${estado === 'ACTIVO' ? '#28a745' : '#dc3545'};">
                      ${estado}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <!-- Información del reporte -->
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 14px;">📄 Información del Reporte</h4>
          <div style="font-size: 12px; color: #856404;">
            <p style="margin: 5px 0;"><strong>Total de registros:</strong> ${this.filteredAlumnos.length} alumnos</p>
            <p style="margin: 5px 0;"><strong>Filtros aplicados:</strong> ${this.getFilterDescription()}</p>
            <p style="margin: 5px 0;"><strong>Propósito:</strong> Reporte administrativo y de gestión deportiva</p>
            <p style="margin: 5px 0;"><strong>Generado por:</strong> Sistema de Gestión Club 9 de Julio</p>
          </div>
        </div>
        
        <!-- Footer con información de contacto -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #28a745; color: #666; font-size: 11px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 10px;">
            <div>
              <strong style="color: #28a745;">📍 Dirección</strong><br>
              CALLE Africa s/n Barrio 9 de julio<br>
              Palpalá, Argentina
            </div>
            <div>
              <strong style="color: #28a745;">📞 Contacto</strong><br>
              Tel: 0388 15-472-6885<br>
              Email: info@club9dejulio.com
            </div>
            <div>
              <strong style="color: #28a745;">🌐 Web</strong><br>
              www.club9dejulio.com<br>
              @club9dejulio
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="margin: 0; font-style: italic;">"Formando campeones dentro y fuera del campo" - Club 9 de Julio</p>
        </div>
      </div>
    `;

    document.body.appendChild(elementoTemporal);

    const opciones = {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 900,
      height: elementoTemporal.scrollHeight
    };

    html2canvas(elementoTemporal, opciones).then(canvas => {
      document.body.removeChild(elementoTemporal);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 280;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nombreArchivo = `reporte-alumnos-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Reporte PDF generado correctamente');
    }).catch(error => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF');
    });
  }

  /**
   * Obtener descripción de filtros aplicados
   */
  private getFilterDescription(): string {
    const filtros: string[] = [];
    
    if (this.searchTerm) {
      filtros.push(`Búsqueda: "${this.searchTerm}"`);
    }
    if (this.selectedStatus) {
      filtros.push(`Estado: ${this.selectedStatus}`);
    }
    if (this.selectedTutor) {
      const tutor = this.tutores.find(t => t._id === this.selectedTutor);
      if (tutor) {
        filtros.push(`Tutor: ${tutor.nombreCompleto || tutor.username}`);
      }
    }
    if (this.selectedCategoria) {
      const categoria = this.categorias.find(c => c._id === this.selectedCategoria);
      if (categoria) {
        filtros.push(`Categoría: ${categoria.nombre}`);
      }
    }
    
    return filtros.length > 0 ? filtros.join(', ') : 'Ninguno';
  }
}