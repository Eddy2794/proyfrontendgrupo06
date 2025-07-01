import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Alumno } from '../../models/alumno.model';
import { AlumnoDetalleModalComponent } from './alumno-detalle-modal.component';
import { AlumnoListComponent } from './alumno-list/alumno-list.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-alumno',
  imports: [CommonModule, AlumnoListComponent, AlumnoDetalleModalComponent],
  templateUrl: './alumno.component.html',
  styleUrl: './alumno.component.scss'
})
export class AlumnoComponent {
  modalAbierto = false;
  alumnoSeleccionado: Alumno | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  abrirDetalle(alumno: Alumno) {
    this.alumnoSeleccionado = alumno;
    this.modalAbierto = true;
  }

  cerrarDetalle() {
    this.modalAbierto = false;
    this.alumnoSeleccionado = null;
  }

  irAFormulario(alumno: Alumno) {
    this.router.navigate(['./alumno-form', alumno._id], { relativeTo: this.route });
  }

  nuevoAlumno() {
    this.irAFormulario({ _id: '0' } as any);
  }
} 