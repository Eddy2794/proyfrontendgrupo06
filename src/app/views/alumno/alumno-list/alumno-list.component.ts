import { Component, EventEmitter, Output } from '@angular/core';
import { AlumnoService } from '../../../services/alumno.service';
import { Alumno, AlumnoModel } from '../../../models/alumno.model';
import { CommonModule } from '@angular/common';
import { FormModule } from '@coreui/angular';

@Component({
  standalone: true,
  selector: 'app-alumno-list',
  imports: [CommonModule, FormModule],
  templateUrl: './alumno-list.component.html',
  styleUrls: ['./alumno-list.component.scss']
})
export class AlumnoListComponent {
  alumnos: Alumno[] = [];
  @Output() verDetalle = new EventEmitter<Alumno>();
  @Output() modificar = new EventEmitter<Alumno>();
  @Output() nuevoAlumno = new EventEmitter<void>();

  constructor(private alumnoService: AlumnoService) {
    this.getAlumnos();
  }

  getAlumnos() {
    this.alumnoService.getAlumnos().subscribe({
      next: (result) => {
        this.alumnos = result.data.alumnos.map((a: any) => AlumnoModel.fromJSON(a));
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
      }
    });
  }

  onVerDetalle(alumno: Alumno) {
    this.verDetalle.emit(alumno);
  }

  onModificar(alumno: Alumno) {
    this.modificar.emit(alumno);
  }

  onEliminar(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar este alumno?')) {
      this.alumnoService.deleteAlumnoFisico(id).subscribe({
        next: result => {
          if (result.success == true) {
            alert("El alumno se eliminó correctamente");
            this.getAlumnos();
          }
        },
        error: error => {
          alert("Ocurrió un error al eliminar");
          console.log(error);
        }
      })
    }
  }

  onNuevoAlumno() {
    this.nuevoAlumno.emit();
  }
} 