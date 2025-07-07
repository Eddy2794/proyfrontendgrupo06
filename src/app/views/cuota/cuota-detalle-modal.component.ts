import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cuota } from '../../models/cuota.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-cuota-detalle-modal',
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white align-items-center py-2">
            <h6 class="modal-title d-flex align-items-center mb-0">
              <i class="bi bi-receipt me-2"></i> Detalle de la Cuota
            </h6>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="cerrar()"></button>
          </div>
          <div class="modal-body small" *ngIf="cuota">
            <div class="mb-2 fw-bold text-secondary"><i class="bi bi-receipt me-2"></i>Datos de la Cuota</div>
            <ul class="list-group list-group-flush mb-3">
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-person me-2"></i><b>Alumno-Categoría:</b></span>
                <span>{{ getRelacionNombre() }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar me-2"></i><b>Período:</b></span>
                <span>{{ cuota.mes }} {{ cuota.anio }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-cash-coin me-2"></i><b>Monto:</b></span>
                <span>{{ cuota.monto | number:'1.2-2' }} ARS</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-percent me-2"></i><b>Descuento:</b></span>
                <span>{{ cuota.descuento || 0 }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-exclamation-circle me-2"></i><b>Recargo:</b></span>
                <span>{{ cuota.recargo || 0 }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-currency-exchange me-2"></i><b>Total a Pagar:</b></span>
                <span>{{ calcularTotal() | number:'1.2-2' }} ARS</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-info-circle me-2"></i><b>Estado:</b></span>
                <span><span class="badge bg-{{ cuota.estado === 'PENDIENTE' ? 'warning' : cuota.estado === 'PAGA' ? 'success' : 'danger' }}">{{ cuota.estado }}</span></span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar-event me-2"></i><b>Fecha de Vencimiento:</b></span>
                <span>{{ cuota.fecha_vencimiento | date:'dd/MM/yyyy' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar-check me-2"></i><b>Fecha de Pago:</b></span>
                <span>{{ cuota.fecha_pago ? (cuota.fecha_pago | date:'dd/MM/yyyy') : '-' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-credit-card me-2"></i><b>Método de Pago:</b></span>
                <span>{{ cuota.metodo_pago || '-' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-receipt-cutoff me-2"></i><b>N° Comprobante:</b></span>
                <span>{{ cuota.comprobante_numero || '-' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-card-text me-2"></i><b>Observaciones:</b></span>
                <span>{{ cuota.observaciones || '-' }}</span>
              </li>
            </ul>
            <div class="text-muted small">ID: {{ cuota._id }}</div>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-secondary btn-sm px-3" (click)="cerrar()">
              <i class="bi bi-x-lg me-1"></i> Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CuotaDetalleModalComponent {
  @Input() cuota: Cuota | null = null;
  @Output() close = new EventEmitter<void>();

  cerrar() {
    this.close.emit();
  }

  calcularTotal(): number {
    if (!this.cuota) return 0;
    return (this.cuota.monto - (this.cuota.descuento || 0) + (this.cuota.recargo || 0));
  }

  getRelacionNombre(): string {
    // Buscar primero en alumno_categoria_id (como en la lista)
    let rel = (this.cuota as any)?.alumno_categoria_id;
    if (rel && typeof rel === 'object') {
      // Nombre del alumno
      let nombreAlumno = 'Alumno no identificado';
      if (rel.alumno && rel.alumno.persona) {
        nombreAlumno = `${rel.alumno.persona.nombres} ${rel.alumno.persona.apellidos}`;
      }
      // Nombre de la categoría
      let nombreCategoria = 'Categoría no identificada';
      if (rel.categoria_datos && rel.categoria_datos.nombre) {
        nombreCategoria = rel.categoria_datos.nombre;
      }
      return `${nombreAlumno} - ${nombreCategoria}`;
    }
    // Fallback: usar alumno_categoria_datos si existe
    if (this.cuota && (this.cuota as any).alumno_categoria_datos) {
      const alumno = (this.cuota as any).alumno_categoria_datos.alumno_datos?.persona;
      const categoria = (this.cuota as any).alumno_categoria_datos.categoria_datos;
      const nombreAlumno = alumno && typeof alumno === 'object' && 'nombres' in alumno && 'apellidos' in alumno
        ? `${alumno.nombres} ${alumno.apellidos}`
        : 'Alumno no identificado';
      const nombreCategoria = categoria && typeof categoria === 'object' && 'nombre' in categoria
        ? categoria.nombre
        : 'Categoría no identificada';
      return `${nombreAlumno} - ${nombreCategoria}`;
    }
    return 'Relación no identificada';
  }
} 