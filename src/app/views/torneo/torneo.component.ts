import { Component, OnInit } from '@angular/core';
import { TorneoService } from '../../services/torneo.service';
import { NotificationService } from '../../services/notification.service';
import { Torneo } from '../../models/torneo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Importaciones comentadas - usando versiones globales
// // import { jsPDF } from 'jspdf'; // Usando versión global
// // import html2canvas from 'html2canvas'; // Usando versión global

// Declaración de variables globales para las librerías PDF
declare var jsPDF: any;
declare var html2canvas: any;

import {
  TableDirective,
  ColComponent,
  RowComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  AlertComponent,
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  TooltipDirective
} from '@coreui/angular';
import { type ChartData } from 'chart.js';
import { IconDirective } from '@coreui/icons-angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import {AuthService} from '../../services/auth.service';
@Component({
  selector: 'app-torneo',
  imports: [FormsModule, CommonModule,
    TableDirective,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ColComponent,
    RowComponent,
    AlertComponent,
    ButtonCloseDirective,
    ButtonDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ChartjsComponent,
    IconDirective,
    TooltipDirective
  ],
  templateUrl: './torneo.component.html',
  styleUrl: './torneo.component.scss'
})
export class TorneoComponent implements OnInit {
  torneos: Torneo[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;

  data: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Torneos por mes',
        backgroundColor: '#f87979',
        data: []
      }
    ]
  };
  constructor(
    private torneoService: TorneoService, 
    private router: Router,
    private notificationService: NotificationService,
    public authService: AuthService
  ) {
    this.getTorneos();
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

  ngOnInit(): void {
    this.torneoService.getTorneos().subscribe({
      next: result => {
        const torneos = result.data;
        const conteoPorMes = new Array(12).fill(0); // enero a diciembre

        torneos.forEach((torneo: any) => {
          let fecha: Date | null = null;

          if (typeof torneo.fecha_inicio === 'string') {
            fecha = new Date(torneo.fecha_inicio);
          } else if (torneo.fecha_inicio?.$date) {
            fecha = new Date(torneo.fecha_inicio.$date);
          }

          if (fecha && !isNaN(fecha.getTime())) {
            const mes = fecha.getMonth(); // 0 = enero
            conteoPorMes[mes]++;
          }
        });

        this.data = {
          labels: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ],
          datasets: [{
            label: 'Torneos por mes',
            backgroundColor: '#f87979',
            data: conteoPorMes
          }]
        };
      },
      error: err => {
        console.error('Error al cargar torneos', err);
      }
    });
  }
  ocultarAlerta() {
    setTimeout(() => {
      this.mostrarExito = false;
      this.mostrarError = false;
    }, 2000);
  }
  getTorneos() {
    this.torneoService.getTorneos().subscribe({
      next: (result) => {
        this.torneos = result.data;
      },
      error: (err) => {
        console.error('Error al cargar torneos:', err);
      }
    });
  }
  agregar() {
    this.router.navigate(['torneo-form', '0']);
  }
  modificar(torneo: Torneo) {
    this.router.navigate(['torneo-form', torneo._id]);
  }
  eliminarTorneo() {
    if (!this.torneoAEliminar || !this.torneoAEliminar._id) return;
    this.torneoService.deleteTorneo(this.torneoAEliminar._id).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "El torneo se eliminó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();
          this.getTorneos();
        }
      },
      error: error => {
        this.mensajeError = "Ocurrió un error al eliminar";
        this.mostrarError = true;
        this.ocultarAlerta();
        console.log(error);
      }
    })
  }
  visible = false;
  torneoAEliminar: Torneo | null = null;

  toggleLiveDemo(torneo?: Torneo) {
    if (torneo) {
      this.torneoAEliminar = torneo;
    }
    this.visible = !this.visible;
  }


  handleLiveDemoChange(event: any) {
    this.visible = event;
  }

  /**
   * Exportar lista de torneos a PDF
   */
  async exportarTorneosPDF(): Promise<void> {
    if (this.torneos.length === 0) {
      this.notificationService.showWarning('Advertencia', 'No hay torneos para exportar');
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
    const torneosActivos = this.torneos.filter(t => t.activo === true).length;
    const torneosInactivos = this.torneos.filter(t => t.activo === false).length;
    const torneosProximos = this.torneos.filter(t => {
      const fechaInicio = new Date(t.fecha_inicio);
      return fechaInicio > new Date() && t.activo;
    }).length;
    const torneosEnCurso = this.torneos.filter(t => {
      const fechaInicio = new Date(t.fecha_inicio);
      const hoy = new Date();
      // Consideramos en curso si empezó hace menos de 30 días
      const diferenciaDias = (hoy.getTime() - fechaInicio.getTime()) / (1000 * 3600 * 24);
      return diferenciaDias >= 0 && diferenciaDias <= 30 && t.activo;
    }).length;

    // Calcular costos
    const costos = this.torneos.map(t => t.costo_inscripcion || 0);
    const costoPromedio = costos.length > 0 ? 
      (costos.reduce((a, b) => a + b, 0) / costos.length).toFixed(2) : '0';
    const costoMaximo = costos.length > 0 ? Math.max(...costos) : 0;

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
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Reporte General de Torneos</h2>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Estadísticas -->
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h4 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 16px;">📊 Estadísticas Generales</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 12px; text-align: center;">
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #28a745;">${torneosActivos}</div>
              <div>Activos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #dc3545;">${torneosInactivos}</div>
              <div>Inactivos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #17a2b8;">${torneosProximos}</div>
              <div>Próximos</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <div style="font-size: 18px; font-weight: bold; color: #ffc107;">${torneosEnCurso}</div>
              <div>En Curso</div>
            </div>
          </div>
        </div>
        
        <!-- Tabla detallada de torneos -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #28a745; color: white;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Torneo</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Descripción</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Lugar</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Fecha Inicio</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Costo</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Organizador</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${this.torneos.map((torneo, index) => {
              const fechaInicio = new Date(torneo.fecha_inicio).toLocaleDateString('es-ES');
              const costo = torneo.costo_inscripcion ? `$${torneo.costo_inscripcion.toLocaleString()}` : 'Gratuito';
              
              return `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                  <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">
                    ${torneo.nombre || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${torneo.descripcion || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${torneo.lugar || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${fechaInicio}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">
                    ${costo}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd;">
                    ${torneo.organizador || 'N/A'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                    <span style="padding: 2px 6px; border-radius: 3px; font-size: 9px; color: white; background: ${torneo.activo ? '#28a745' : '#dc3545'};">
                      ${torneo.activo ? 'ACTIVO' : 'INACTIVO'}
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
            <p style="margin: 5px 0;"><strong>Total de registros:</strong> ${this.torneos.length} torneos</p>
            <p style="margin: 5px 0;"><strong>Costo promedio de inscripción:</strong> $${costoPromedio}</p>
            <p style="margin: 5px 0;"><strong>Costo máximo de inscripción:</strong> $${costoMaximo.toLocaleString()}</p>
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

      const nombreArchivo = `reporte-torneos-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Reporte PDF generado correctamente');
    }).catch((error: any) => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF');
    });
  }
}
