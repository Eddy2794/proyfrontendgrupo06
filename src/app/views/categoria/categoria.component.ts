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
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


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
    console.log('Cargando torneos para categoría:', categoriaId);
    this.torneoCategoriaService.getTorneosPorCategoria(categoriaId).subscribe({
      next: (response: any) => {
        console.log('Respuesta de torneos:', response);
        this.torneosCategoria = response.data || response || [];
        console.log('Torneos cargados:', this.torneosCategoria);
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

  exportarAlumnosPDF(): void {
    if (!this.categoriaSeleccionada || this.alumnosCategoria.length === 0) {
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
    const alumnosActivos = this.alumnosCategoria.filter(a => a.estado === 'ACTIVO').length;
    const alumnosInactivos = this.alumnosCategoria.filter(a => a.estado === 'INACTIVO').length;
    
    // Calcular distribución por género y edades
    const generos = { masculino: 0, femenino: 0, otro: 0 };
    const edades: number[] = [];
    
    this.alumnosCategoria.forEach(alumno => {
      const personaAlumno = alumno.alumno_datos?.persona_datos || alumno.alumno_datos?.persona;
      if (personaAlumno?.genero) {
        if (personaAlumno.genero.toLowerCase() === 'masculino' || personaAlumno.genero.toLowerCase() === 'm') {
          generos.masculino++;
        } else if (personaAlumno.genero.toLowerCase() === 'femenino' || personaAlumno.genero.toLowerCase() === 'f') {
          generos.femenino++;
        } else {
          generos.otro++;
        }
      }
      
      if (personaAlumno?.fechaNacimiento) {
        const fechaNac = new Date(personaAlumno.fechaNacimiento);
        const edad = new Date().getFullYear() - fechaNac.getFullYear();
        edades.push(edad);
      }
    });
    
    const edadMinima = edades.length > 0 ? Math.min(...edades) : 0;
    const edadMaxima = edades.length > 0 ? Math.max(...edades) : 0;
    
    // Obtener información del entrenador
    const nombreEntrenador = this.getNombreProfesor(this.categoriaSeleccionada._id);
    
    // Formatear horarios
    const horariosTexto = this.categoriaSeleccionada.horarios && this.categoriaSeleccionada.horarios.length > 0
      ? this.categoriaSeleccionada.horarios.map(h => `${h.dia}: ${h.hora_inicio || h.horaInicio} - ${h.hora_fin || h.horaFin}`).join(', ')
      : 'No definidos';

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
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Reporte de Alumnos por Categoría</h2>
          <h3 style="color: #28a745; font-size: 18px; margin: 5px 0;">${this.categoriaSeleccionada.nombre}</h3>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Información de la Categoría -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h4 style="color: #28a745; margin: 0 0 10px 0; font-size: 16px;">📋 Información de la Categoría</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
            <div><strong>Descripción:</strong> ${this.categoriaSeleccionada.descripcion || 'No especificada'}</div>
            <div><strong>Tipo:</strong> ${this.categoriaSeleccionada.tipo}</div>
            <div><strong>Rango de edad:</strong> ${this.categoriaSeleccionada.edadMinima} - ${this.categoriaSeleccionada.edadMaxima} años</div>
            <div><strong>Cuota mensual:</strong> $${this.categoriaSeleccionada.precio?.cuotaMensual || 0}</div>
            <div><strong>Entrenador:</strong> ${nombreEntrenador}</div>
            <div><strong>Estado:</strong> ${this.categoriaSeleccionada.estado}</div>
          </div>
          <div style="margin-top: 10px;"><strong>Horarios:</strong> ${horariosTexto}</div>
        </div>
        
        <!-- Estadísticas -->
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h4 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 16px;">📊 Estadísticas</h4>
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
              <div style="font-size: 18px; font-weight: bold; color: #6f42c1;">${generos.masculino}M / ${generos.femenino}F</div>
              <div>Distribución</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #fd7e14;">${edadMinima}-${edadMaxima}</div>
              <div>Rango edades</div>
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
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">F. Inscripción</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Contacto Emergencia</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Teléfono</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Obs. Médicas</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Fotos</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${this.alumnosCategoria.map((alumno, index) => {
                const personaAlumno = alumno.alumno_datos?.persona_datos || alumno.alumno_datos?.persona;
                const datosAlumno = alumno.alumno_datos;
                
                // Calcular edad
                let edad = 'N/A';
                if (personaAlumno?.fechaNacimiento) {
                  const fechaNac = new Date(personaAlumno.fechaNacimiento);
                  const edadCalculada = new Date().getFullYear() - fechaNac.getFullYear();
                  const mesActual = new Date().getMonth();
                  const mesNacimiento = fechaNac.getMonth();
                  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && new Date().getDate() < fechaNac.getDate())) {
                    edad = (edadCalculada - 1).toString();
                  } else {
                    edad = edadCalculada.toString();
                  }
                }
                
                const fechaInscripcion = alumno.fecha_inscripcion || datosAlumno?.fecha_inscripcion
                  ? new Date(alumno.fecha_inscripcion || datosAlumno?.fecha_inscripcion).toLocaleDateString('es-ES')
                  : 'N/A';
                
                return `
                  <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                    <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">
                      ${datosAlumno?.numero_socio || 'N/A'}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd;">
                      ${personaAlumno?.nombres || ''} ${personaAlumno?.apellidos || ''}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd;">
                      ${personaAlumno?.numeroDocumento || 'N/A'}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                      ${edad}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd;">
                      ${fechaInscripcion}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd;">
                      ${datosAlumno?.contacto_emergencia || 'N/A'}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd;">
                      ${datosAlumno?.telefono_emergencia || 'N/A'}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd; font-size: 9px;">
                      ${datosAlumno?.observaciones_medicas || 'Ninguna'}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                      ${datosAlumno?.autoriza_fotos ? '✓' : '✗'}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                      <span style="padding: 2px 6px; border-radius: 3px; font-size: 9px; color: white; background: ${alumno.estado === 'ACTIVO' ? '#28a745' : '#dc3545'};">
                        ${alumno.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
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
            <p style="margin: 5px 0;"><strong>Total de registros:</strong> ${this.alumnosCategoria.length} alumnos</p>
            <p style="margin: 5px 0;"><strong>Filtros aplicados:</strong> Categoría: ${this.categoriaSeleccionada.nombre}</p>
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

      const nombreArchivo = `reporte-alumnos-${this.categoriaSeleccionada?.nombre?.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Reporte PDF generado correctamente con información completa');
    }).catch(error => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF');
    });
  }
}
