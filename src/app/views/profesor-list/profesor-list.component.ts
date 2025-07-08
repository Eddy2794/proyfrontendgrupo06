import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfesorService } from '../../services/profesor.service';
import { NotificationService } from '../../services/notification.service';
// Importaciones comentadas - usando versiones globales
// // import { jsPDF } from 'jspdf'; // Usando versión global
// // import html2canvas from 'html2canvas'; // Usando versión global

// Declaración de variables globales para las librerías PDF
declare var jsPDF: any;
declare var html2canvas: any;

import { 
  RowComponent,
  ColComponent, 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  ButtonDirective,
  AlertComponent,
  TableDirective,
  BadgeComponent,
  SpinnerComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalTitleDirective,
  ButtonCloseDirective,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor, DatePipe, DecimalPipe } from '@angular/common';
import { ProfesorModel } from '../../models/profesor-model';

@Component({
  selector: 'app-profesor-list',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    AlertComponent,
    TableDirective,
    BadgeComponent,
    SpinnerComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalTitleDirective,
    ButtonCloseDirective,
    TooltipDirective,
    IconDirective,
    NgIf,
    NgFor,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './profesor-list.component.html',
  styleUrl: './profesor-list.component.scss'
})
export class ProfesorListComponent implements OnInit {
 
  // ===== PROPIEDADES PRINCIPALES =====
  profesores: ProfesorModel[] = [];
  paginatedItems: ProfesorModel[] = [];
  
  // ===== MENSAJES =====
  successMessage = '';
  errorMessage = '';
  
  // ===== ESTADOS DE CARGA =====
  loading = false;
  loadingDetalles = false;
  
  // ===== PAGINACIÓN =====
  currentPage = 1;
  itemsPerPage = 10;
  
  // ===== MODALES =====
  modalDetallesVisible = false;
  modalEliminarVisible = false;
  profesorSeleccionado: ProfesorModel | null = null;
  profesorAEliminar: ProfesorModel | null = null;
  
  constructor(
    private profesorService: ProfesorService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.getProfesores();
  }

  /**
   * Carga las librerías PDF de forma dinámica
   */
  private async loadPDFLibraries(): Promise<void> {
    // Verificar si las librerías ya están cargadas
    if (typeof (window as any).jspdf !== 'undefined' && typeof (window as any).html2canvas !== 'undefined') {
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];
    
    if (typeof (window as any).jspdf === 'undefined') {
      promises.push(this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
    }
    
    if (typeof (window as any).html2canvas === 'undefined') {
      promises.push(this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
    }

    await Promise.all(promises);
  }

  /**
   * Carga un script de forma dinámica
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  // ===== MÉTODOS DE CARGA DE DATOS =====
  getProfesores() {
    this.loading = true;
    this.profesorService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data.map((prof: any) => ProfesorModel.fromJSON(prof));
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los profesores';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // ===== MÉTODOS DE PAGINACIÓN =====
  onPageChange(page: number) {
    this.currentPage = page;
    this.actualizarPaginacion();
  }

  private actualizarPaginacion() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedItems = this.profesores.slice(startIndex, endIndex);
  }

  get totalItems(): number {
    return this.profesores.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  trackByProfesor(index: number, profesor: ProfesorModel): string {
    return profesor._id;
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  editProfesor(profesor: ProfesorModel) {
    this.router.navigate(['/profesor'], { 
      queryParams: { 
        edit: 'true',
        id: profesor._id
      }
    });
  }

  addProfesor() {
    this.router.navigate(['/profesor']);
  }
  
  // ===== MÉTODOS DE MODALES =====
  abrirDetalles(profesor: ProfesorModel) {
    this.profesorSeleccionado = profesor;
    this.modalDetallesVisible = true;
    this.cargarDetallesProfesor(profesor._id);
  }

  cerrarDetalles() {
    this.modalDetallesVisible = false;
    this.profesorSeleccionado = null;
  }

  onModalDetallesChange(visible: boolean) {
    if (!visible) {
      this.cerrarDetalles();
    }
  }

  confirmarEliminacion(profesor: ProfesorModel) {
    this.profesorAEliminar = profesor;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.profesorAEliminar = null;
  }

  onModalEliminarChange(visible: boolean) {
    if (!visible) {
      this.cerrarModalEliminar();
    }
  }

  confirmarEliminarProfesor() {
    if (this.profesorAEliminar) {
      this.deleteProfesor(this.profesorAEliminar._id);
      this.cerrarModalEliminar();
    }
  }

  // ===== MÉTODOS DE CRUD =====
  deleteProfesor(id: string) {
      this.profesorService.deleteProfesor(id).subscribe({
        next: (response: any) => {
          this.successMessage = 'Profesor eliminado exitosamente';
          this.getProfesores();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el profesor';
          console.error('Error:', error);
        }
      });
    }

  // ===== MÉTODOS DE UTILIDAD =====
  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getExperienceBadgeColor(experiencia: number): string {
    if (experiencia <= 5) return 'info';
    if (experiencia <= 10) return 'warning';
    if (experiencia <= 15) return 'primary';
    return 'success';
  }

  getDireccionCompleta(profesor: ProfesorModel): string {
    if (!profesor.personaData.direccion) return '';
    
    const dir = profesor.personaData.direccion;
    const partes = [
      dir.calle,
      dir.ciudad,
      dir.departamento,
      dir.codigoPostal,
      dir.pais
    ].filter(Boolean);
    
    return partes.join(', ');
  }

  // ===== MÉTODOS DE CARGA DE DETALLES =====
  private cargarDetallesProfesor(profesorId: string) {
    this.loadingDetalles = true;
    
    // Simular carga de datos adicionales
    setTimeout(() => {
      this.loadingDetalles = false;
    }, 1000);
  }

  /**
   * Exportar lista de profesores a PDF
   */
  async exportarProfesoresPDF(): Promise<void> {
    if (this.profesores.length === 0) {
      this.notificationService.showWarning('Advertencia', 'No hay profesores para exportar');
      return;
    }

    try {
      // Cargar librerías PDF dinámicamente
      await this.loadPDFLibraries();
    } catch (error) {
      console.error('Error cargando librerías PDF:', error);
      this.notificationService.showError('Error', 'No se pudieron cargar las librerías necesarias para generar el PDF');
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

    // Calcular estadísticas
    const profesoresActivos = this.profesores.filter(p => p.personaData?.estado === 'ACTIVO').length;
    const profesoresInactivos = this.profesores.filter(p => p.personaData?.estado === 'INACTIVO').length;
    const profesoresSuspendidos = 0; // No hay estado SUSPENDIDO en PersonaModel

    // Calcular distribución por género y experiencia
    const generos = { masculino: 0, femenino: 0, otro: 0 };
    const experiencias: number[] = [];

    this.profesores.forEach(profesor => {
      if (profesor.personaData?.genero) {
        if (profesor.personaData.genero.toLowerCase() === 'masculino' || profesor.personaData.genero.toLowerCase() === 'm') {
          generos.masculino++;
        } else if (profesor.personaData.genero.toLowerCase() === 'femenino' || profesor.personaData.genero.toLowerCase() === 'f') {
          generos.femenino++;
        } else {
          generos.otro++;
        }
      }

      if (profesor.experiencia_anios) {
        experiencias.push(profesor.experiencia_anios);
      }
    });

    const experienciaPromedio = experiencias.length > 0 ? 
      (experiencias.reduce((a, b) => a + b, 0) / experiencias.length).toFixed(1) : '0';
    const experienciaMaxima = experiencias.length > 0 ? Math.max(...experiencias) : 0;

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
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Reporte General de Profesores</h2>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Estadísticas -->
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h4 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 16px;">📊 Estadísticas Generales</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 12px; text-align: center;">
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #28a745;">${profesoresActivos}</div>
              <div>Activos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #dc3545;">${profesoresInactivos}</div>
              <div>Inactivos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #ffc107;">${profesoresSuspendidos}</div>
              <div>Suspendidos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #6f42c1;">${experienciaPromedio} años</div>
              <div>Exp. Promedio</div>
            </div>
          </div>
        </div>
        
        <!-- Tabla detallada de profesores -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #28a745; color: white;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Profesor</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">DNI</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Email</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Teléfono</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Experiencia</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Especialidad</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${this.profesores.map((profesor, index) => {
              return `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                  <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">
                    ${profesor.personaData?.nombres || ''} ${profesor.personaData?.apellidos || ''}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${profesor.personaData?.numeroDocumento || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${profesor.personaData?.email || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${profesor.personaData?.telefono || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                ${profesor.experiencia_anios || 0} años
              </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                     ${profesor.titulo || 'N/A'}
                   </td>
                  <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                     <span style="padding: 2px 6px; border-radius: 3px; font-size: 9px; color: white; background: ${profesor.personaData?.estado === 'ACTIVO' ? '#28a745' : '#dc3545'};">
                       ${profesor.personaData?.estado || 'N/A'}
                     </span>
                   </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <!-- Información del reporte -->
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 14px;">📄 Información del Reporte</h4>
          <div style="font-size: 12px; color: #856404;">
            <p style="margin: 5px 0;"><strong>Total de registros:</strong> ${this.profesores.length} profesores</p>
            <p style="margin: 5px 0;"><strong>Distribución por género:</strong> ${generos.masculino} M / ${generos.femenino} F / ${generos.otro} Otro</p>
            <p style="margin: 5px 0;"><strong>Experiencia máxima:</strong> ${experienciaMaxima} años</p>
            <p style="margin: 5px 0;"><strong>Propósito:</strong> Reporte administrativo y de gestión deportiva</p>
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

    // Obtener referencias locales a las librerías
    const jsPDFLib = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
    const html2canvasLib = (window as any).html2canvas;

    if (!jsPDFLib) {
      throw new Error('jsPDF no está disponible');
    }

    if (!html2canvasLib) {
      throw new Error('html2canvas no está disponible');
    }

    html2canvasLib(elementoTemporal, opciones).then((canvas: HTMLCanvasElement) => {
      document.body.removeChild(elementoTemporal);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFLib('p', 'mm', 'a4');
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

      const nombreArchivo = `reporte-profesores-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Reporte PDF generado correctamente');
    }).catch((error: any) => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF');
    });
  }

  /**
   * Exportar detalles de un profesor específico a PDF
   */
  async exportarProfesorDetallesPDF(): Promise<void> {
    try {
      // Cargar librerías PDF dinámicamente
      await this.loadPDFLibraries();
    } catch (error) {
      console.error('Error cargando librerías PDF:', error);
      this.notificationService.showError('Error', 'No se pudieron cargar las librerías necesarias para generar el PDF');
      return;
    }
    if (!this.profesorSeleccionado) {
      this.notificationService.showWarning('Advertencia', 'No hay profesor seleccionado para exportar');
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
    const profesor = this.profesorSeleccionado;

    // Calcular información adicional
    const fechaNacimiento = profesor.personaData?.fechaNacimiento ? 
      new Date(profesor.personaData.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificada';
    
    const edad = profesor.personaData?.fechaNacimiento ? 
      new Date().getFullYear() - new Date(profesor.personaData.fechaNacimiento).getFullYear() : 'N/A';
    
    const fechaContratacion = profesor.fecha_contratacion ? 
      new Date(profesor.fecha_contratacion).toLocaleDateString('es-ES') : 'No especificada';
    
    const antiguedad = profesor.fecha_contratacion ? 
      new Date().getFullYear() - new Date(profesor.fecha_contratacion).getFullYear() : 0;

    const direccionCompleta = this.getDireccionCompleta(profesor) || 'No especificada';

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
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Perfil Detallado del Profesor</h2>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Información personal principal -->
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h3 style="color: #17a2b8; margin: 0 0 15px 0; font-size: 18px;">👤 Información Personal</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Nombre Completo:</strong><br>
              <span style="font-size: 14px;">${profesor.personaData?.nombres || ''} ${profesor.personaData?.apellidos || ''}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Documento:</strong><br>
              <span style="font-size: 14px;">${profesor.personaData?.tipoDocumento || 'DNI'}: ${profesor.personaData?.numeroDocumento || 'N/A'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Fecha de Nacimiento:</strong><br>
              <span style="font-size: 14px;">${fechaNacimiento} (${edad} años)</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Género:</strong><br>
              <span style="font-size: 14px;">${profesor.personaData?.genero || 'No especificado'}</span>
            </div>
          </div>
        </div>
        
        <!-- Información de contacto -->
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📞 Información de Contacto</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Email:</strong><br>
              <span style="font-size: 14px;">${profesor.personaData?.email || 'No especificado'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Teléfono:</strong><br>
              <span style="font-size: 14px;">${profesor.personaData?.telefono || 'No especificado'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; grid-column: 1 / -1;">
              <strong style="color: #ffc107;">Dirección:</strong><br>
              <span style="font-size: 14px;">${direccionCompleta}</span>
            </div>
          </div>
        </div>
        
        <!-- Información profesional -->
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">🎓 Información Profesional</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Título:</strong><br>
              <span style="font-size: 14px;">${profesor.titulo}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Años de Experiencia:</strong><br>
              <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; color: white; background: ${this.getExperienceBadgeColor(profesor.experiencia_anios) === 'info' ? '#17a2b8' : this.getExperienceBadgeColor(profesor.experiencia_anios) === 'warning' ? '#ffc107' : this.getExperienceBadgeColor(profesor.experiencia_anios) === 'primary' ? '#0d6efd' : '#28a745'};">${profesor.experiencia_anios} años</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Fecha de Contratación:</strong><br>
              <span style="font-size: 14px;">${fechaContratacion}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Antigüedad:</strong><br>
              <span style="font-size: 14px;">${antiguedad} años en el club</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Salario:</strong><br>
              <span style="font-size: 14px;">$${(profesor.salario || 0).toLocaleString()}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Estado:</strong><br>
              <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; color: white; background: #28a745;">ACTIVO</span>
            </div>
          </div>
        </div>
        
        <!-- Información del reporte -->
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
          <h4 style="color: #721c24; margin: 0 0 10px 0; font-size: 14px;">📄 Información del Reporte</h4>
          <div style="font-size: 12px; color: #721c24;">
            <p style="margin: 5px 0;"><strong>Tipo de reporte:</strong> Perfil Detallado de Profesor</p>
            <p style="margin: 5px 0;"><strong>Profesor:</strong> ${profesor.personaData?.nombres || ''} ${profesor.personaData?.apellidos || ''}</p>
            <p style="margin: 5px 0;"><strong>Especialidad:</strong> ${profesor.titulo}</p>
            <p style="margin: 5px 0;"><strong>Propósito:</strong> Documento oficial de información profesional y personal</p>
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

    // Obtener referencias locales a las librerías
    const jsPDFLib = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
    const html2canvasLib = (window as any).html2canvas;

    if (!jsPDFLib) {
      throw new Error('jsPDF no está disponible');
    }

    if (!html2canvasLib) {
      throw new Error('html2canvas no está disponible');
    }

    html2canvasLib(elementoTemporal, opciones).then((canvas: HTMLCanvasElement) => {
      document.body.removeChild(elementoTemporal);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFLib('p', 'mm', 'a4');
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

      const nombreArchivo = `profesor-${profesor.personaData.nombres}-${profesor.personaData.apellidos}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Detalles del profesor exportados a PDF correctamente');
    }).catch((error: any) => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF de los detalles del profesor');
    });
  }
}