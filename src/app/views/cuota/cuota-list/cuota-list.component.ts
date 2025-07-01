import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CuotaService } from '../../../services/cuota.service';
import { CuotaModel } from '../../../models/cuota.model';
import { CommonModule } from '@angular/common';
import { FormModule } from '@coreui/angular';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';

@Component({
  standalone: true,
  selector: 'app-cuota-list',
  imports: [CommonModule, FormModule],
  templateUrl: './cuota-list.component.html',
  styleUrls: ['./cuota-list.component.scss']
})
export class CuotaListComponent {
  cuotas: CuotaModel[] = [];
  @Output() verDetalle = new EventEmitter<CuotaModel>();
  @Output() modificar = new EventEmitter<CuotaModel>();
  @Output() nuevaCuota = new EventEmitter<void>();
  relacionesAlumnoCategoria: any[] = [];

  constructor(
    private cuotaService: CuotaService,
    private alumnoCategoriaService: AlumnoCategoriaService
  ) {
    this.getCuotas();
    this.getRelacionesAlumnoCategoria();
  }

  getCuotas() {
    this.cuotaService.getCuotas().subscribe({
      next: (result) => {
        console.log('Respuesta cuotas:', result);
        this.cuotas = Array.isArray(result.data) ? result.data.map((c: any) => CuotaModel.fromJSON(c)) : [];
        console.log('Cuotas mapeadas:', this.cuotas);
      },
      error: (err) => {
        console.error('Error al cargar cuotas:', err);
      }
    });
  }

  getRelacionesAlumnoCategoria() {
    this.alumnoCategoriaService.getAlumnoCategorias().subscribe({
      next: (result) => {
        if (result.data && Array.isArray(result.data.datos)) {
          this.relacionesAlumnoCategoria = result.data.datos;
        } else {
          this.relacionesAlumnoCategoria = [];
        }
      },
      error: () => {
        this.relacionesAlumnoCategoria = [];
      }
    });
  }

  onVerDetalle(cuota: CuotaModel) {
    // Eliminar la lógica relacionada al modal
  }

  onModificar(cuota: CuotaModel) {
    this.modificar.emit(cuota);
  }

  onEliminar(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar esta cuota?')) {
      this.cuotaService.deleteCuota(id).subscribe({
        next: result => {
          if (result.success == true) {
            alert("La cuota se eliminó correctamente");
            this.getCuotas();
          }
        },
        error: error => {
          alert("Ocurrió un error al eliminar");
          console.log(error);
        }
      })
    }
  }

  onNuevaCuota() {
    this.nuevaCuota.emit();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge bg-warning';
      case 'PAGA': return 'badge bg-success';
      case 'VENCIDA': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getNombreAlumno(c: any): string {
    const rel = c.alumno_categoria_id;
    if (
      rel &&
      typeof rel === 'object' &&
      rel.alumno &&
      rel.alumno.persona
    ) {
      return `${rel.alumno.persona.nombres} ${rel.alumno.persona.apellidos}`;
    }
    return 'No identificado';
  }

  getNombreCategoria(c: any): string {
    if (
      c.alumno_categoria_id &&
      typeof c.alumno_categoria_id === 'object' &&
      c.alumno_categoria_id.categoria_datos
    ) {
      return c.alumno_categoria_id.categoria_datos.nombre;
    }
    return 'No identificada';
  }

  onPagar(cuota: CuotaModel) {
    const id = cuota._id?.toString();
    if (!id) {
      alert('ID de cuota no válido');
      return;
    }
    if (confirm('¿Confirmás marcar esta cuota como pagada?')) {
      this.cuotaService.marcarComoPagada(id, {
        fecha_pago: new Date(),
        metodo_pago: 'EFECTIVO'
      }).subscribe({
        next: () => {
          alert('¡Cuota marcada como pagada!');
          this.getCuotas();
        },
        error: () => {
          alert('Ocurrió un error al marcar como pagada');
        }
      });
    }
  }
}
