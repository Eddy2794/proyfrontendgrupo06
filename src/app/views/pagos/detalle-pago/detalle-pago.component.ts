import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  CardModule, 
  GridModule, 
  ButtonModule,
  BadgeModule,
  SpinnerModule,
  AlertModule 
} from '@coreui/angular';

import { PagoService } from '../../../services/pago.service';
import { Pago } from '../../../models';

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    GridModule,
    ButtonModule,
    BadgeModule,
    SpinnerModule,
    AlertModule
  ],
  template: `
    <c-row>
      <c-col lg="8" class="mx-auto">
        <c-card *ngIf="!loading && pago; else loadingTemplate">
          <c-card-header>
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <button 
                  cButton 
                  variant="ghost" 
                  color="secondary" 
                  size="sm"
                  class="me-3"
                  (click)="goBack()">
                  ⬅️
                </button>
                <h4 class="mb-0">💳 Detalle del Pago</h4>
              </div>
              <c-badge [color]="getStatusColor(pago.estado)" class="fs-6">
                {{ getStatusText(pago.estado) }}
              </c-badge>
            </div>
          </c-card-header>
          <c-card-body>
            <!-- Información general -->
            <div class="mb-4">
              <h5>ℹ️ Información General</h5>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <strong>ID del Pago:</strong><br>
                    <span class="text-body-secondary">{{ pago._id }}</span>
                  </div>
                  <div class="mb-3">
                    <strong>Monto:</strong><br>
                    <span class="h5 text-success">\${{ pago.monto | number:'1.2-2' }}</span>
                  </div>
                  <div class="mb-3">
                    <strong>Tipo de Período:</strong><br>
                    <span class="text-capitalize">{{ pago.tipoPeriodo }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.montoDescuento">
                    <strong>Descuento Aplicado:</strong><br>
                    <span class="text-success">\${{ pago.montoDescuento | number:'1.2-2' }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <strong>Fecha de Creación:</strong><br>
                    <span>{{ pago.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.fechaPago">
                    <strong>Fecha de Pago:</strong><br>
                    <span>{{ pago.fechaPago | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.fechaVencimiento">
                    <strong>Fecha de Vencimiento:</strong><br>
                    <span>{{ pago.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.mercadopagoId">
                    <strong>ID de MercadoPago:</strong><br>
                    <span class="text-body-secondary">{{ pago.mercadopagoId }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Período de cobertura -->
            <div class="mb-4">
              <h5>📅 Período de Cobertura</h5>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <strong>Inicio del Período:</strong><br>
                    <span>{{ pago.periodoInicio | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <strong>Fin del Período:</strong><br>
                    <span>{{ pago.periodoFin | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detalles del pago (si existen) -->
            <div class="mb-4" *ngIf="pago.detallesPago">
              <h5>💰 Detalles del Pago</h5>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3" *ngIf="pago.detallesPago.metodoPago">
                    <strong>Método de Pago:</strong><br>
                    <span class="text-capitalize">{{ pago.detallesPago.metodoPago }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.detallesPago.tipoTarjeta">
                    <strong>Tipo de Tarjeta:</strong><br>
                    <span class="text-capitalize">{{ pago.detallesPago.tipoTarjeta }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.detallesPago.ultimosDigitos">
                    <strong>Últimos Dígitos:</strong><br>
                    <span>****{{ pago.detallesPago.ultimosDigitos }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3" *ngIf="pago.detallesPago.cuotas">
                    <strong>Cuotas:</strong><br>
                    <span>{{ pago.detallesPago.cuotas }}</span>
                  </div>
                  <div class="mb-3" *ngIf="pago.detallesPago.transactionId">
                    <strong>ID de Transacción:</strong><br>
                    <span class="text-body-secondary">{{ pago.detallesPago.transactionId }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Historial de estados -->
            <div class="mb-4" *ngIf="pago.historialEstados && pago.historialEstados.length > 0">
              <h5>📊 Historial de Estados</h5>
              <div class="timeline">
                <div 
                  *ngFor="let estado of pago.historialEstados; let first = first" 
                  class="timeline-item"
                  [class.timeline-item-current]="first">
                  <div class="timeline-marker">
                    <span>{{ getStatusEmoji(estado.estado) }}</span>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">{{ getStatusText(estado.estado) }}</h6>
                        <small class="text-body-secondary">
                          {{ estado.fecha | date:'dd/MM/yyyy HH:mm' }}
                        </small>
                        <p *ngIf="estado.observaciones" class="mb-0 mt-2 text-body-secondary">
                          {{ estado.observaciones }}
                        </p>
                      </div>
                      <c-badge [color]="getStatusColor(estado.estado)">
                        {{ getStatusText(estado.estado) }}
                      </c-badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="d-flex justify-content-between">
              <button 
                cButton 
                color="secondary" 
                variant="outline"
                (click)="goBack()">
                ⬅️ Volver
              </button>
              <div>
                <button 
                  cButton 
                  color="danger" 
                  variant="outline"
                  class="me-2"
                  *ngIf="pago.estado === 'pendiente'"
                  (click)="cancelPayment()"
                  [disabled]="cancelling">
                  ❌ Cancelar Pago
                </button>
                <button 
                  cButton 
                  color="primary" 
                  variant="outline"
                  (click)="refreshStatus()">
                  🔄 Actualizar Estado
                </button>
              </div>
            </div>
          </c-card-body>
        </c-card>

        <!-- Alerta de error -->
        <c-alert 
          color="danger" 
          *ngIf="error && !loading"
          [dismissible]="true">
          <h6>Error al cargar el pago</h6>
          {{ error }}
        </c-alert>
      </c-col>
    </c-row>

    <!-- Template de carga -->
    <ng-template #loadingTemplate>
      <c-row>
        <c-col xs="12" class="text-center">
          <c-spinner color="primary"></c-spinner>
          <p class="mt-2 text-body-secondary">Cargando detalles del pago...</p>
        </c-col>
      </c-row>
    </ng-template>
  `,
  styles: [`
    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #dee2e6;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
    }

    .timeline-marker {
      position: absolute;
      left: -2rem;
      top: 0;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .timeline-item-current .timeline-marker {
      background: #0d6efd;
      border-color: #0d6efd;
      color: white;
    }

    .timeline-content {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 3px solid #dee2e6;
    }

    .timeline-item-current .timeline-content {
      border-left-color: #0d6efd;
    }
  `]
})
export class DetallePagoComponent implements OnInit {
  private pagoService = inject(PagoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pago: Pago | null = null;
  loading = true;
  error: string | null = null;
  cancelling = false;

  ngOnInit() {
    const pagoId = this.route.snapshot.params['id'];
    if (pagoId) {
      this.loadPago(pagoId);
    } else {
      this.error = 'ID del pago no proporcionado';
      this.loading = false;
    }
  }

  private loadPago(pagoId: string) {
    this.loading = true;
    this.error = null;

    this.pagoService.getPayment(pagoId).subscribe({
      next: (response) => {
        this.pago = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el pago:', error);
        this.error = error.error?.message || 'No se pudo cargar el detalle del pago';
        this.loading = false;
      }
    });
  }

  refreshStatus() {
    if (!this.pago?._id) return;
    
    this.pagoService.getPaymentStatus(this.pago._id).subscribe({
      next: (response) => {
        this.pago = response.data;
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
      }
    });
  }

  cancelPayment() {
    if (!this.pago || this.pago.estado !== 'pendiente') return;

    if (confirm('¿Estás seguro de que deseas cancelar este pago?')) {
      this.cancelling = true;

      this.pagoService.cancelPayment(this.pago._id!).subscribe({
        next: (response) => {
          this.pago = response.data;
          this.cancelling = false;
        },
        error: (error) => {
          console.error('Error al cancelar el pago:', error);
          alert('No se pudo cancelar el pago. Inténtalo nuevamente.');
          this.cancelling = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/pagos/historial']);
  }

  getStatusColor(estado: string): string {
    const colors: { [key: string]: string } = {
      'pendiente': 'warning',
      'aprobado': 'success',
      'rechazado': 'danger',
      'cancelado': 'secondary',
      'procesando': 'info'
    };
    return colors[estado] || 'secondary';
  }

  getStatusText(estado: string): string {
    const texts: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'cancelado': 'Cancelado',
      'procesando': 'Procesando'
    };
    return texts[estado] || estado;
  }

  getStatusEmoji(estado: string): string {
    const emojis: { [key: string]: string } = {
      'pendiente': '⏳',
      'aprobado': '✅',
      'rechazado': '❌',
      'cancelado': '🚫',
      'procesando': '⚙️'
    };
    return emojis[estado] || '❓';
  }
}
