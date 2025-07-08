import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CuotaService } from '../../../services/cuota.service';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { Cuota, CuotaModel, ESTADOS_CUOTA } from '../../../models/cuota.model';
import { AlumnoCategoria, AlumnoCategoriaModel } from '../../../models/alumno-categoria.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  SpinnerComponent,
  ButtonDirective,
  FormModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  standalone: true,
  selector: 'app-cuota-form',
  templateUrl: './cuota-form.component.html',
  styleUrls: ['./cuota-form.component.scss'],
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    SpinnerComponent,
    ButtonDirective,
    FormModule,
    IconDirective,
    FormsModule,
    DecimalPipe
  ]
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
  originalCuota: any = null;
  bloqueoPagada = false;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cuotaService: CuotaService,
    private alumnoCategoriaService: AlumnoCategoriaService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    // Cargar primero las relaciones alumno-categoría, luego la cuota si es edición
    this.cargarRelacionesAlumnoCategoria().then(() => {
      if (id && id !== '0') {
        this.isEdit = true;
        this.cuotaService.getCuota(id).subscribe({
          next: (result) => {
            console.log('Datos de la cuota recibidos:', result.data);
            
            this.cuota = CuotaModel.fromJSON(result.data);
            // Guardar copia original para comparar cambios
            this.originalCuota = JSON.parse(JSON.stringify(this.cuota));
            // Si la cuota está pagada, mostrar mensaje visual y redirigir
            if (this.cuota.estado && this.cuota.estado.toUpperCase() === 'PAGA') {
              this.loading = false;
              this.bloqueoPagada = true;
              setTimeout(() => {
                this.router.navigate(['/cuota']);
              }, 2000);
              return;
            }
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
        this.loading = false;
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

  private normalizarCuota(obj: any): any {
    return {
      alumno_categoria_id: obj.alumno_categoria_id || '',
      mes: (obj.mes || '').toString().toUpperCase(),
      anio: obj.anio ? obj.anio.toString() : '',
      monto: obj.monto ? Number(obj.monto) : 0,
      estado: (obj.estado || '').toString().toUpperCase(),
      fecha_vencimiento: obj.fecha_vencimiento ? new Date(obj.fecha_vencimiento).toISOString().substring(0, 10) : '',
      fecha_pago: obj.fecha_pago ? new Date(obj.fecha_pago).toISOString().substring(0, 10) : '',
      metodo_pago: obj.metodo_pago || '',
      descuento: obj.descuento ? Number(obj.descuento) : 0,
      recargo: obj.recargo ? Number(obj.recargo) : 0,
      observaciones: obj.observaciones ? obj.observaciones.trim() : '',
      comprobante_numero: obj.comprobante_numero || ''
    };
  }

  guardar() {
    this.submitted = true;
    if (this.isEdit) {
      const actual = JSON.stringify(this.normalizarCuota(this.cuota));
      const original = JSON.stringify(this.normalizarCuota(this.originalCuota));
      if (actual === original) {
        alert('No se detectaron cambios para guardar.');
        return;
      }
    }
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

  isFormChanged(): boolean {
    if (!this.isEdit || !this.originalCuota) return true;
    // Compara los campos relevantes
    const campos = [
      'alumno_categoria_id', 'mes', 'anio', 'monto', 'estado', 'fecha_vencimiento',
      'fecha_pago', 'metodo_pago', 'descuento', 'recargo', 'observaciones', 'comprobante_numero'
    ];
    for (const campo of campos) {
      let actual = (this.cuota as any)[campo];
      let original = (this.originalCuota as any)[campo];
      // Normalizar fechas a string para comparar
      if (actual instanceof Date) actual = actual.toISOString();
      if (original instanceof Date) original = original.toISOString();
      if ((actual || '') !== (original || '')) return true;
    }
    return false;
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
