import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CuotaService } from '../../../services/cuota.service';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { Cuota, CuotaModel, ESTADOS_CUOTA } from '../../../models/cuota.model';
import { AlumnoCategoria, AlumnoCategoriaModel } from '../../../models/alumno-categoria.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-cuota-form',
  templateUrl: './cuota-form.component.html',
  styleUrls: ['./cuota-form.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class CuotaFormComponent implements OnInit {
  cuota: CuotaModel = new CuotaModel();
  relacionesAlumnoCategoria: AlumnoCategoria[] = [];
  estados = ESTADOS_CUOTA;
  meses = [
    { value: 'ENERO', label: 'Enero' },
    { value: 'FEBRERO', label: 'Febrero' },
    { value: 'MARZO', label: 'Marzo' },
    { value: 'ABRIL', label: 'Abril' },
    { value: 'MAYO', label: 'Mayo' },
    { value: 'JUNIO', label: 'Junio' },
    { value: 'JULIO', label: 'Julio' },
    { value: 'AGOSTO', label: 'Agosto' },
    { value: 'SEPTIEMBRE', label: 'Septiembre' },
    { value: 'OCTUBRE', label: 'Octubre' },
    { value: 'NOVIEMBRE', label: 'Noviembre' },
    { value: 'DICIEMBRE', label: 'Diciembre' }
  ];
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cuotaService: CuotaService,
    private alumnoCategoriaService: AlumnoCategoriaService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Cargar primero las relaciones alumno-categoría, luego la cuota si es edición
    this.cargarRelacionesAlumnoCategoria().then(() => {
      if (id && id !== '0') {
        this.isEdit = true;
        this.loading = true;
        this.cuotaService.getCuota(id).subscribe({
          next: (result) => {
            console.log('Datos de la cuota recibidos:', result.data);
            
            this.cuota = CuotaModel.fromJSON(result.data);
            // Normalizar fecha de vencimiento para el input type="date"
            if (this.cuota.fecha_vencimiento) {
              const fecha = new Date(this.cuota.fecha_vencimiento);
              this.cuota.fecha_vencimiento = fecha.toISOString().substring(0, 10);
            }
            // Normalizar el mes a mayúsculas
            if (this.cuota.mes) {
              this.cuota.mes = this.cuota.mes.toUpperCase();
            }
            
            // Asegurar que alumno_categoria_id sea string
            if (this.cuota.alumno_categoria_id && typeof this.cuota.alumno_categoria_id === 'object' && this.cuota.alumno_categoria_id._id) {
              this.cuota.alumno_categoria_id = this.cuota.alumno_categoria_id._id.toString();
            } else if (typeof this.cuota.alumno_categoria_id === 'string') {
              // ya está bien
            }
            // Buscar y setear el objeto de la relación para mostrar datos del alumno
            const relacion = this.relacionesAlumnoCategoria.find(
              r => r._id && r._id.toString() === this.cuota.alumno_categoria_id
            );
            if (relacion) {
              this.cuota.alumno_categoria_datos = relacion;
            }
            
            console.log('Cuota final:', this.cuota);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar la cuota:', err);
            alert('Error al cargar la cuota');
            this.loading = false;
          }
        });
      } else {
        this.isEdit = false;
        this.cuota = new CuotaModel();
        // Establecer año actual por defecto
        this.cuota.anio = new Date().getFullYear();
        // Estado por defecto
        this.cuota.estado = 'PENDIENTE';
      }
    });
  }

  async cargarRelacionesAlumnoCategoria(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.alumnoCategoriaService.getAlumnoCategorias().subscribe({
        next: (result) => {
          console.log('Relaciones alumno-categoría recibidas:', result.data);
          // Ajuste: tomar el array desde result.data.datos
          if (result.data && Array.isArray(result.data.datos)) {
            this.relacionesAlumnoCategoria = result.data.datos;
          } else {
            this.relacionesAlumnoCategoria = [];
          }
          resolve();
        },
        error: (err) => {
          alert('Error al cargar relaciones alumno-categoría');
          reject(err);
        }
      });
    });
  }

  calcularTotal(): number {
    return (this.cuota.monto - (this.cuota.descuento || 0) + (this.cuota.recargo || 0));
  }

  guardar() {
    if (this.isEdit) {
      this.cuotaService.updateCuota(this.cuota).subscribe({
        next: () => {
          alert('Cuota actualizada correctamente');
          this.router.navigate(['/cuota']);
        },
        error: () => {
          alert('Error al actualizar la cuota');
        }
      });
    } else {
      this.cuotaService.addCuota(this.cuota).subscribe({
        next: () => {
          alert('Cuota creada correctamente');
          this.router.navigate(['/cuota']);
        },
        error: () => {
          alert('Error al crear la cuota');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/cuota']);
  }

  getNombreRelacion(relacion: any): string {
    const alumno = relacion.alumno_datos?.persona || relacion.alumno?.persona;
    const categoria = relacion.categoria_datos;
    if (alumno && categoria && typeof alumno === 'object') {
      return `${alumno.nombres} ${alumno.apellidos} - ${categoria.nombre}`;
    }
    return relacion._id || 'Relación no válida';
  }
}
