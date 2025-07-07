import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Alumno } from '../../models/alumno.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-alumno-detalle-modal',
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white align-items-center py-2">
            <h6 class="modal-title d-flex align-items-center mb-0">
              <i class="bi bi-person-vcard me-2"></i> Detalles del Alumno
            </h6>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="cerrar()"></button>
          </div>
          <div class="modal-body small" *ngIf="alumno">
            <div class="mb-2 fw-bold text-secondary"><i class="bi bi-person-fill me-2"></i>Datos del Alumno</div>
            <ul class="list-group list-group-flush mb-3">
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-person me-2"></i><b>Nombre:</b></span>
                <span>{{ alumno.persona_datos?.nombres }} {{ alumno.persona_datos?.apellidos }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-hash me-2"></i><b>Número de Socio:</b></span>
                <span>{{ alumno.numero_socio }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-activity me-2"></i><b>Estado:</b></span>
                <span><span class="badge bg-{{ alumno.estado === 'ACTIVO' ? 'success' : 'secondary' }}">{{ alumno.estado }}</span></span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar-date me-2"></i><b>Fecha de Inscripción:</b></span>
                <span>{{ alumno.fecha_inscripcion | date:'dd/MM/yyyy' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-heart-pulse me-2"></i><b>Observaciones Médicas:</b></span>
                <span>{{ alumno.observaciones_medicas || '-' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-person-check me-2"></i><b>Autoriza Fotos:</b></span>
                <span>{{ alumno.autoriza_fotos ? 'Sí' : 'No' }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-telephone me-2"></i><b>Contacto de Emergencia:</b></span>
                <span>{{ alumno.contacto_emergencia }}</span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-telephone-forward me-2"></i><b>Teléfono de Emergencia:</b></span>
                <span>{{ alumno.telefono_emergencia }}</span>
              </li>
            </ul>
            <div class="mb-2 fw-bold text-secondary"><i class="bi bi-person-badge me-2"></i>Datos del Tutor</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-person me-2"></i><b>Nombre:</b></span>
                <span>
                  {{
                    getTutorPersona()
                      ? (getTutorPersona().nombres + ' ' + getTutorPersona().apellidos)
                      : '-'
                  }}
                </span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-credit-card me-2"></i><b>Documento:</b></span>
                <span>
                  {{
                    getTutorPersona()
                      ? getTutorPersona().numeroDocumento
                      : '-'
                  }}
                </span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-envelope me-2"></i><b>Email:</b></span>
                <span>
                  {{
                    getTutorPersona()
                      ? getTutorPersona().email
                      : '-'
                  }}
                </span>
              </li>
              <li class="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-telephone me-2"></i><b>Teléfono:</b></span>
                <span>
                  {{
                    getTutorPersona()
                      ? getTutorPersona().telefono
                      : '-'
                  }}
                </span>
              </li>
            </ul>
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
export class AlumnoDetalleModalComponent {
  @Input() alumno: Alumno | null = null;
  @Output() close = new EventEmitter<void>();

  cerrar() {
    this.close.emit();
  }

  getTutorPersona(): any | null {
    if (this.alumno && typeof this.alumno.tutor === 'object' && this.alumno.tutor !== null && 'persona' in this.alumno.tutor) {
      return (this.alumno.tutor as any).persona;
    }
    return null;
  }
} 