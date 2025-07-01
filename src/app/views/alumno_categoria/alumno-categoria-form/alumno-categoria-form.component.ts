import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { AlumnoService } from '../../../services/alumno.service';
//import { CategoriaService } from '../../../services/categoria.service';
import { AlumnoCategoria, AlumnoCategoriaModel } from '../../../models/alumno-categoria.model';
import { Alumno } from '../../../models/alumno.model';
//import { Categoria } from '../../../models/categoria.model';

@Component({
  standalone: true,
  selector: 'app-alumno-categoria-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './alumno-categoria-form.component.html',
  styleUrls: ['./alumno-categoria-form.component.scss']
})
export class AlumnoCategoriaFormComponent implements OnInit {
  relacion: AlumnoCategoriaModel = new AlumnoCategoriaModel();
  alumnos: Alumno[] = [];
  //categorias: Categoria[] = [];
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alumnoCategoriaService: AlumnoCategoriaService,
    private alumnoService: AlumnoService,
    //private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
   /* const id = this.route.snapshot.paramMap.get('id');
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
      // this.relacion.fecha_inscripcion = ''; // Dejar vacío para que el usuario la seleccione
      this.relacion.estado = 'ACTIVO';
    }*/
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

  guardar() {
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