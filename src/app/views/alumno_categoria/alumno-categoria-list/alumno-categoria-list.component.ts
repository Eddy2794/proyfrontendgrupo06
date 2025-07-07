import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { AlumnoCategoria } from '../../../models/alumno-categoria.model';
import { AuthService } from '../../../services/auth.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria';
import { AlumnoService } from '../../../services/alumno.service';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  SpinnerComponent,
  BadgeComponent,
  ButtonDirective,
  TooltipDirective,
  TableDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  standalone: true,
  selector: 'app-alumno-categoria-list',
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    SpinnerComponent,
    BadgeComponent,
    ButtonDirective,
    TooltipDirective,
    IconDirective,
    TableDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective
  ],
  templateUrl: './alumno-categoria-list.component.html',
  styleUrls: ['./alumno-categoria-list.component.scss']
})
export class AlumnoCategoriaListComponent implements OnInit {
  relaciones: AlumnoCategoria[] = [];
  relacionesFiltradas: AlumnoCategoria[] = [];
  loading = false;

  // Filtros
  searchTerm: string = '';
  selectedEstado: string | undefined;
  selectedCategoria: string | undefined;
  categorias: Categoria[] = [];

  // Modal de desactivación
  showDesactivarModal = false;
  relacionADesactivar: AlumnoCategoria | null = null;
  motivoBaja = '';
  fechaBaja = '';

  constructor(
    private alumnoCategoriaService: AlumnoCategoriaService,
    private categoriaService: CategoriaService,
    private alumnoService: AlumnoService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarRelaciones();
    // Por defecto mostrar solo activos
    this.selectedEstado = 'ACTIVO';
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (resp) => {
        this.categorias = resp.data.categorias || [];
      },
      error: () => {
        this.categorias = [];
      }
    });
  }

  cargarRelaciones() {
    this.loading = true;
    this.alumnoCategoriaService.getAlumnoCategorias().subscribe({
      next: (result) => {
        this.relaciones = result.data?.datos || result.datos || result.data || [];
        this.relacionesFiltradas = [...this.relaciones];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        alert('Error al cargar las relaciones');
        this.loading = false;
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.aplicarFiltros();
  }

  onEstadoFilter(estado: string | undefined) {
    this.selectedEstado = estado || undefined;
    this.aplicarFiltros();
  }

  onCategoriaFilter(categoriaId: string | undefined) {
    this.selectedCategoria = categoriaId || undefined;
    this.aplicarFiltros();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedEstado = 'ACTIVO'; // Volver a mostrar solo activos por defecto
    this.selectedCategoria = undefined;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.relacionesFiltradas = this.relaciones.filter(r => {
      // Filtro por estado
      if (this.selectedEstado && r.estado !== this.selectedEstado) return false;
      // Filtro por categoría
      if (this.selectedCategoria && (!r.categoria_datos || r.categoria_datos._id !== this.selectedCategoria)) return false;
      // Filtro por nombre de alumno
      if (this.searchTerm) {
        let nombre = '';
        
        if (r.alumno_datos) {
          // Intentar diferentes formas de acceder al nombre
          if (r.alumno_datos.persona_datos && (r.alumno_datos.persona_datos as any).nombres) {
            nombre = `${(r.alumno_datos.persona_datos as any).nombres} ${(r.alumno_datos.persona_datos as any).apellidos}`.toLowerCase();
          } else if (r.alumno_datos.persona && typeof r.alumno_datos.persona === 'object' && (r.alumno_datos.persona as any).nombres) {
            nombre = `${(r.alumno_datos.persona as any).nombres} ${(r.alumno_datos.persona as any).apellidos}`.toLowerCase();
          } else if (typeof r.alumno_datos === 'object' && 'nombres' in r.alumno_datos) {
            nombre = `${(r.alumno_datos as any).nombres} ${(r.alumno_datos as any).apellidos}`.toLowerCase();
          }
        }
        
        if (!nombre.includes(this.searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }

  editar(relacion: AlumnoCategoria) {
    this.router.navigate(['./alumno-categoria-form', relacion._id], { relativeTo: this.route });
  }

  private getNombreAlumno(relacion: AlumnoCategoria): string {
    if (relacion.alumno_datos && (relacion.alumno_datos.persona_datos as any)?.nombres) {
      return `${(relacion.alumno_datos.persona_datos as any).nombres} ${(relacion.alumno_datos.persona_datos as any).apellidos}`;
    }
    if (relacion.alumno_datos && (relacion.alumno_datos.persona as any)?.nombres) {
      return `${(relacion.alumno_datos.persona as any).nombres} ${(relacion.alumno_datos.persona as any).apellidos}`;
    }
    if (relacion.alumno_datos && (relacion.alumno_datos as any)?.nombres) {
      return `${(relacion.alumno_datos as any).nombres} ${(relacion.alumno_datos as any).apellidos}`;
    }
    if (relacion.alumno_datos && (relacion.alumno_datos as any)?._id) {
      return `ID: ${(relacion.alumno_datos as any)._id}`;
    }
    if (typeof relacion.alumno === 'string') {
      return `ID: ${relacion.alumno}`;
    }
    return 'Alumno no identificado';
  }

  toggleEstado(relacion: AlumnoCategoria) {
    const nombreAlumno = this.getNombreAlumno(relacion);
    if (relacion.estado === 'ACTIVO') {
      // Desactivar - mostrar modal para capturar motivo
      this.relacionADesactivar = relacion;
      this.motivoBaja = '';
      this.fechaBaja = new Date().toISOString().substring(0, 10);
      this.showDesactivarModal = true;
    } else {
      // Activar - confirmación simple
      if (confirm(`¿Está seguro de que desea activar la relación del alumno "${nombreAlumno}" en la categoría "${relacion.categoria_datos?.nombre}"?`)) {
        this.activarRelacion(relacion);
      }
    }
  }

  confirmarDesactivacion() {
    if (!this.relacionADesactivar) return;
    
    if (!this.motivoBaja.trim()) {
      alert('El motivo de baja es obligatorio');
      return;
    }

    const relacion = this.relacionADesactivar;
    relacion.estado = 'INACTIVO';
    relacion.fecha_baja = this.fechaBaja;
    relacion.motivo_baja = this.motivoBaja;

    this.alumnoCategoriaService.updateAlumnoCategoria(relacion).subscribe({
      next: () => {
        alert('Relación desactivada correctamente');
        this.cerrarModal();
        this.cargarRelaciones();
      },
      error: () => {
        alert('Error al desactivar la relación');
      }
    });
  }

  cerrarModal() {
    this.showDesactivarModal = false;
    this.relacionADesactivar = null;
    this.motivoBaja = '';
    this.fechaBaja = '';
  }

  private activarRelacion(relacion: AlumnoCategoria) {
    relacion.estado = 'ACTIVO';
    relacion.fecha_baja = undefined;
    relacion.motivo_baja = undefined;

    this.alumnoCategoriaService.updateAlumnoCategoria(relacion).subscribe({
      next: () => {
        alert('Relación activada correctamente');
        this.cargarRelaciones();
      },
      error: () => {
        alert('Error al activar la relación');
      }
    });
  }

  eliminar(relacion: AlumnoCategoria) {
    const nombreAlumno = this.getNombreAlumno(relacion);
    const nombreCategoria = relacion.categoria_datos?.nombre;
    
    if (relacion.estado === 'ACTIVO') {
      if (confirm(`¿Está seguro de que desea eliminar la relación ACTIVA del alumno "${nombreAlumno}" en la categoría "${nombreCategoria}"?\n\nEsta acción eliminará permanentemente la relación activa.`)) {
        this.eliminarRelacion(relacion);
      }
    } else {
      if (confirm(`¿Está seguro de que desea eliminar permanentemente la relación del alumno "${nombreAlumno}" en la categoría "${nombreCategoria}"?\n\nEsta acción no se puede deshacer.`)) {
        this.eliminarRelacion(relacion);
      }
    }
  }

  private eliminarRelacion(relacion: AlumnoCategoria) {
    // 1. Buscar el alumno
    const alumnoId = typeof relacion.alumno === 'string' ? relacion.alumno : (relacion.alumno as any)?._id;
    if (!alumnoId) {
      alert('No se pudo determinar el alumno de la relación.');
      return;
    }

    // 2. Obtener el alumno para verificar si la relación es la principal
    this.alumnoService.getAlumno(alumnoId).subscribe({
      next: (alumnoResp) => {
        const alumno = alumnoResp.data || alumnoResp;
        const categoriaPrincipalId = typeof alumno.categoriaPrincipal === 'string'
          ? alumno.categoriaPrincipal
          : alumno.categoriaPrincipal?._id;
        const categoriaRelacionId = typeof relacion.categoria === 'string'
          ? relacion.categoria
          : relacion.categoria?._id;

        if (categoriaPrincipalId === categoriaRelacionId) {
          // 3. Buscar otras relaciones activas del alumno
          this.alumnoCategoriaService.getCategoriasPorAlumno(alumnoId).subscribe({
            next: (resp) => {
              const relaciones = resp.data || resp;
              // Filtrar solo activas y distintas a la que se va a eliminar
              const otrasActivas = (relaciones as any[]).filter(r => r.estado === 'ACTIVO' && r._id !== relacion._id);
              if (otrasActivas.length === 0) {
                alert('No se puede eliminar la última relación. Un alumno debe estar en al menos una categoría.');
                return;
              }
              // Elegir la más reciente (por fecha_inscripcion)
              const nuevaPrincipal = otrasActivas.sort((a, b) => new Date(b.fecha_inscripcion).getTime() - new Date(a.fecha_inscripcion).getTime())[0];
              // Actualizar el alumno con la nueva categoriaPrincipal
              this.alumnoService.updateAlumno(alumnoId, { categoriaPrincipal: nuevaPrincipal.categoria }).subscribe({
                next: () => {
                  alert('La relación principal fue actualizada automáticamente. Si no ves el cambio reflejado, recarga la página.');
                  // Ahora sí eliminar la relación
                  this.eliminarRelacionFinal(relacion);
                },
                error: () => {
                  alert('Error al actualizar la categoría principal del alumno.');
                }
              });
            },
            error: () => {
              alert('Error al buscar las relaciones del alumno.');
            }
          });
        } else {
          // No es la principal, eliminar normalmente
          this.eliminarRelacionFinal(relacion);
        }
      },
      error: () => {
        alert('Error al obtener los datos del alumno.');
      }
    });
  }

  private eliminarRelacionFinal(relacion: AlumnoCategoria) {
    this.alumnoCategoriaService.deleteAlumnoCategoriaFisico(relacion._id!).subscribe({
      next: () => {
        alert('Relación eliminada correctamente');
        this.cargarRelaciones();
      },
      error: () => {
        alert('Error al eliminar la relación');
      }
    });
  }
} 