import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { AlumnoService } from '../../../services/alumno.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AlumnoCategoria, AlumnoCategoriaModel } from '../../../models/alumno-categoria.model';
import { Alumno } from '../../../models/alumno.model';
import { Categoria } from '../../../models/categoria';
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent,
  FormControlDirective,
  ButtonDirective,
  SpinnerComponent,
  AlertComponent,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  standalone: true,
  selector: 'app-alumno-categoria-form',
  imports: [
    CommonModule, 
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    FormControlDirective,
    ButtonDirective,
    SpinnerComponent,
    AlertComponent,
    FormFeedbackComponent,
    FormLabelDirective,
    FormSelectDirective,
    TooltipDirective,
    IconDirective
  ],
  templateUrl: './alumno-categoria-form.component.html',
  styleUrls: ['./alumno-categoria-form.component.scss']
})
export class AlumnoCategoriaFormComponent implements OnInit {
  relacion: AlumnoCategoriaModel = new AlumnoCategoriaModel();
  alumnos: Alumno[] = [];
  categorias: Categoria[] = [];
  isEdit = false;
  loading = false;
  categoriaCambiada = false;
  categoriaOriginal: string | undefined;
  originalRelacion: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alumnoCategoriaService: AlumnoCategoriaService,
    private alumnoService: AlumnoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.cargarAlumnos();
    this.cargarCategorias();
    if (id && id !== '0') {
      this.isEdit = true;
      this.loading = true;
      this.alumnoCategoriaService.getAlumnoCategoria(id).subscribe({
        next: (result) => {
          this.relacion = AlumnoCategoriaModel.fromJSON(result.data);
          if (this.relacion.alumno && typeof this.relacion.alumno === 'object' && this.relacion.alumno._id) {
            this.relacion.alumno = this.relacion.alumno._id;
          }
          if (this.relacion.categoria && typeof this.relacion.categoria === 'object' && this.relacion.categoria._id) {
            this.relacion.categoria = this.relacion.categoria._id;
          }
          if (this.relacion.fecha_inscripcion) {
            if (typeof this.relacion.fecha_inscripcion === 'string' && this.relacion.fecha_inscripcion.length === 10) {
              // No hacer nada, ya está bien
            } else if (typeof this.relacion.fecha_inscripcion === 'string') {
              this.relacion.fecha_inscripcion = this.relacion.fecha_inscripcion.substring(0, 10);
            } else if (this.relacion.fecha_inscripcion instanceof Date) {
              this.relacion.fecha_inscripcion = this.relacion.fecha_inscripcion.toISOString().substring(0, 10);
            }
          }
          // Guardar la categoría original para comparar
          if (this.relacion.categoria) {
            this.categoriaOriginal = typeof this.relacion.categoria === 'string' 
              ? this.relacion.categoria 
              : this.relacion.categoria._id;
          }
          // Guardar copia original solo de los campos editables
          this.originalRelacion = JSON.stringify({
            categoria: this.relacion.categoria,
            fecha_inscripcion: this.relacion.fecha_inscripcion,
            observaciones: this.relacion.observaciones || ''
          });
          this.loading = false;
        },
        error: () => {
          alert('Error al cargar la relación');
          this.loading = false;
        }
      });
    } else {
      this.isEdit = false;
      this.relacion = new AlumnoCategoriaModel();
      this.relacion.fecha_inscripcion = new Date().toISOString().substring(0, 10);
      this.relacion.estado = 'ACTIVO';
    }
  }

  onCategoriaChange() {
    // Verificar si se cambió la categoría en modo edición
    if (this.isEdit && this.categoriaOriginal && this.relacion.categoria !== this.categoriaOriginal) {
      this.categoriaCambiada = true;
    } else {
      this.categoriaCambiada = false;
    }
  }

  cargarAlumnos() {
    this.alumnoService.getAlumnos().subscribe({
      next: (result) => {
        console.log('Respuesta alumnos:', result);
        this.alumnos = result.data?.alumnos || result.data || [];
        console.log('Alumnos cargados:', this.alumnos);
      },
      error: () => {
        alert('Error al cargar alumnos');
      }
    });
  }

  /*cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (result) => {
        console.log('Respuesta categorias:', result);
        this.categorias = result.data?.categorias || [];
        console.log('Categorias cargadas:', this.categorias);
      },
      error: () => {
        alert('Error al cargar categorías');
      }
    });
  }*/

  cargarCategorias() {
    this.categoriaService.getCategoriasActivas().subscribe({
      next: (categorias) => {
        console.log('Respuesta categorias:', categorias);
        this.categorias = categorias || [];
        console.log('Categorias cargadas:', this.categorias);
      },
      error: () => {
        alert('Error al cargar categorías');
      }
    });
  }

  guardar() {
    // Si se cambió la categoría en modo edición, crear nueva relación
    if (this.isEdit && this.categoriaCambiada) {
      if (confirm('¿Está seguro de que desea crear una nueva relación con la categoría seleccionada? La relación actual se mantendrá como historial.')) {
        this.crearNuevaRelacion();
      }
      return;
    }
    // Bloquear si no hay cambios en los campos editables
    if (this.isEdit) {
      const actual = JSON.stringify({
        categoria: this.relacion.categoria,
        fecha_inscripcion: this.relacion.fecha_inscripcion,
        observaciones: this.relacion.observaciones || ''
      });
      if (actual === this.originalRelacion) {
        alert('No se detectaron cambios para guardar.');
        return;
      }
    }
    this.guardarRelacion();
  }

  private crearNuevaRelacion() {
    // Crear nueva relación con la nueva categoría
    const nuevaRelacion = new AlumnoCategoriaModel({
      alumno: this.relacion.alumno,
      categoria: this.relacion.categoria,
      fecha_inscripcion: new Date().toISOString().substring(0, 10),
      estado: 'ACTIVO',
      observaciones: this.relacion.observaciones
    });

    this.alumnoCategoriaService.addAlumnoCategoria(nuevaRelacion).subscribe({
      next: () => {
        alert('Nueva relación creada correctamente');
        this.router.navigate(['/alumno-categoria']);
      },
      error: () => {
        alert('Error al crear la nueva relación');
      }
    });
  }

  private guardarRelacion() {
    if (this.isEdit) {
      this.alumnoCategoriaService.updateAlumnoCategoria(this.relacion).subscribe({
        next: () => {
          alert('Relación actualizada correctamente');
          this.router.navigate(['/alumno-categoria']);
        },
        error: () => {
          alert('Error al actualizar la relación');
        }
      });
    } else {
      this.alumnoCategoriaService.addAlumnoCategoria(this.relacion).subscribe({
        next: () => {
          alert('Relación creada correctamente');
          this.router.navigate(['/alumno-categoria']);
        },
        error: () => {
          alert('Error al crear la relación');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/alumno-categoria']);
  }
}