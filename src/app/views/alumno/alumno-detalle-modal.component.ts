import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Alumno } from '../../models/alumno.model';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
            <button type="button" class="btn btn-success btn-sm px-3 me-2" (click)="exportarAlumnoDetallesPDF()">
              <i class="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
            </button>
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

  private notificationService = inject(NotificationService);

  cerrar() {
    this.close.emit();
  }

  getTutorPersona(): any | null {
    if (this.alumno && typeof this.alumno.tutor === 'object' && this.alumno.tutor !== null && 'persona' in this.alumno.tutor) {
      return (this.alumno.tutor as any).persona;
    }
    return null;
  }

  // Información del tutor
  get tutorInfo(): string {
    const tutorPersona = this.getTutorPersona();
    if (tutorPersona) {
      return `${tutorPersona.nombres || ''} ${tutorPersona.apellidos || ''}`.trim() || 'No disponible';
    }
    return 'No disponible';
  }

  get tutorTelefono(): string {
    const tutorPersona = this.getTutorPersona();
    return tutorPersona?.telefono || 'No disponible';
  }

  get tutorEmail(): string {
    const tutorPersona = this.getTutorPersona();
    return tutorPersona?.email || 'No disponible';
  }

  /**
   * Exportar detalles de un alumno específico a PDF
   */
  exportarAlumnoDetallesPDF(): void {
    if (!this.alumno) {
      this.notificationService.showWarning('Advertencia', 'No hay alumno seleccionado para exportar');
      return;
    }

    const elementoTemporal = document.createElement('div');
    elementoTemporal.style.position = 'absolute';
    elementoTemporal.style.left = '-9999px';
    elementoTemporal.style.top = '0';
    elementoTemporal.style.backgroundColor = 'white';
    elementoTemporal.style.padding = '20px';
    elementoTemporal.style.width = '900px';

    const fechaActual = new Date().toLocaleDateString('es-ES');
    const horaActual = new Date().toLocaleTimeString('es-ES');
    const alumno = this.alumno;
    const tutorPersona = this.getTutorPersona();

    // Calcular información adicional
    const fechaNacimiento = 'No especificada';
    const edad = 'N/A';
    
    const fechaInscripcion = alumno.fecha_inscripcion ? 
      new Date(alumno.fecha_inscripcion).toLocaleDateString('es-ES') : 'No especificada';
    
    const tiempoEnClub = alumno.fecha_inscripcion ? 
      new Date().getFullYear() - new Date(alumno.fecha_inscripcion).getFullYear() : 0;

    elementoTemporal.innerHTML = `
      <div style="font-family: Arial, sans-serif; background: white; padding: 20px; line-height: 1.4;">
        <!-- Header con logo prominente -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #28a745; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">9J</span>
            </div>
            <div>
              <h1 style="color: #28a745; margin: 0; font-size: 28px; font-weight: bold;">Club 9 de Julio</h1>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Institución Deportiva</p>
            </div>
          </div>
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Perfil Detallado del Alumno</h2>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Información personal principal -->
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h3 style="color: #17a2b8; margin: 0 0 15px 0; font-size: 18px;">👤 Información Personal del Alumno</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Nombre Completo:</strong><br>
              <span style="font-size: 14px;">${alumno.persona_datos?.nombres || 'N/A'} ${alumno.persona_datos?.apellidos || ''}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Número de Socio:</strong><br>
              <span style="font-size: 14px;">${alumno.numero_socio || 'N/A'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Documento:</strong><br>
              <span style="font-size: 14px;">N/A</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Estado:</strong><br>
              <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; color: white; background: ${alumno.estado === 'ACTIVO' ? '#28a745' : '#dc3545'};">${alumno.estado || 'N/A'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Fecha de Nacimiento:</strong><br>
              <span style="font-size: 14px;">${fechaNacimiento} (${edad} años)</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Email:</strong><br>
              <span style="font-size: 14px;">N/A</span>
            </div>
          </div>
        </div>
        
        <!-- Información del club -->
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">🏆 Información del Club</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Fecha de Inscripción:</strong><br>
              <span style="font-size: 14px;">${fechaInscripcion}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Tiempo en el Club:</strong><br>
              <span style="font-size: 14px;">${tiempoEnClub} años</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Autoriza Fotos:</strong><br>
              <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; color: white; background: ${alumno.autoriza_fotos ? '#28a745' : '#dc3545'};">${alumno.autoriza_fotos ? 'SÍ' : 'NO'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Observaciones Médicas:</strong><br>
              <span style="font-size: 14px;">${alumno.observaciones_medicas || 'Ninguna'}</span>
            </div>
          </div>
        </div>
        
        <!-- Información de contacto de emergencia -->
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
          <h3 style="color: #721c24; margin: 0 0 15px 0; font-size: 18px;">🚨 Contacto de Emergencia</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #dc3545;">Contacto:</strong><br>
              <span style="font-size: 14px;">${alumno.contacto_emergencia || 'No especificado'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #dc3545;">Teléfono:</strong><br>
              <span style="font-size: 14px;">${alumno.telefono_emergencia || 'No especificado'}</span>
            </div>
          </div>
        </div>
        
        <!-- Información del tutor -->
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">👨‍👩‍👧‍👦 Información del Tutor</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Nombre Completo:</strong><br>
              <span style="font-size: 14px;">${this.tutorInfo}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Documento:</strong><br>
              <span style="font-size: 14px;">${tutorPersona?.numeroDocumento || 'No especificado'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Email:</strong><br>
              <span style="font-size: 14px;">${this.tutorEmail}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Teléfono:</strong><br>
              <span style="font-size: 14px;">${this.tutorTelefono}</span>
            </div>
          </div>
        </div>
        
        <!-- Información del reporte -->
        <div style="background: #e2e3e5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6c757d;">
          <h4 style="color: #495057; margin: 0 0 10px 0; font-size: 14px;">📄 Información del Reporte</h4>
          <div style="font-size: 12px; color: #495057;">
            <p style="margin: 5px 0;"><strong>Tipo de reporte:</strong> Perfil Detallado de Alumno</p>
            <p style="margin: 5px 0;"><strong>Alumno:</strong> ${alumno.persona_datos?.nombres || 'N/A'} ${alumno.persona_datos?.apellidos || ''}</p>
            <p style="margin: 5px 0;"><strong>Número de Socio:</strong> ${alumno.numero_socio || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Propósito:</strong> Documento oficial de información personal y deportiva</p>
            <p style="margin: 5px 0;"><strong>Generado por:</strong> Sistema de Gestión Club 9 de Julio</p>
          </div>
        </div>
        
        <!-- Footer con información de contacto -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #28a745; color: #666; font-size: 11px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 10px;">
            <div>
              <strong style="color: #28a745;">📍 Dirección</strong><br>
              CALLE Africa s/n Barrio 9 de julio<br>
              Palpalá, Argentina
            </div>
            <div>
              <strong style="color: #28a745;">📞 Contacto</strong><br>
              Tel: 0388 15-472-6885<br>
              Email: info@club9dejulio.com
            </div>
            <div>
              <strong style="color: #28a745;">🌐 Web</strong><br>
              www.club9dejulio.com<br>
              @club9dejulio
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="margin: 0; font-style: italic;">"Formando campeones dentro y fuera del campo" - Club 9 de Julio</p>
        </div>
      </div>
    `;

    document.body.appendChild(elementoTemporal);

    const opciones = {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 900,
      height: elementoTemporal.scrollHeight
    };

    html2canvas(elementoTemporal, opciones).then(canvas => {
      document.body.removeChild(elementoTemporal);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 280;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nombreArchivo = `alumno-${alumno.persona_datos?.nombres || 'alumno'}-${alumno.persona_datos?.apellidos || 'detalle'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Detalles del alumno exportados a PDF correctamente');
    }).catch(error => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF de los detalles del alumno');
    });
  }
}