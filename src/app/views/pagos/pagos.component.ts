import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  CardModule, 
  GridModule, 
  ButtonModule,
  BadgeModule,
  SpinnerModule 
} from '@coreui/angular';

import { PagoService } from '../../services/pago.service';
import { CategoriaEscuelaService } from '../../services/categoria-escuela.service';
import { Pago, CategoriaEscuela } from '../../models';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    GridModule,
    ButtonModule,
    BadgeModule,
    SpinnerModule
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4">
          <c-card-header>
            <h4 class="mb-0">💳 Gestión de Pagos</h4>
          </c-card-header>
          <c-card-body>
            <p class="text-body-secondary">
              Desde aquí puedes realizar pagos de cuotas mensuales o anuales, 
              consultar tu historial de pagos y verificar el estado de tus transacciones.
            </p>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Estadísticas de pagos -->
    <c-row class="mb-4" *ngIf="paymentStats">
      <c-col md="3">
        <c-card class="text-center">
          <c-card-body>
            <h4 class="text-primary">{{ paymentStats.totalPagos }}</h4>
            <p class="text-body-secondary mb-0">Total de Pagos</p>
          </c-card-body>
        </c-card>
      </c-col>
      <c-col md="3">
        <c-card class="text-center">
          <c-card-body>
            <h4 class="text-success">\${{ paymentStats.montoTotal | number:'1.2-2' }}</h4>
            <p class="text-body-secondary mb-0">Monto Total</p>
          </c-card-body>
        </c-card>
      </c-col>
      <c-col md="3">
        <c-card class="text-center">
          <c-card-body>
            <h4 class="text-warning">{{ paymentStats.pagosPendientes }}</h4>
            <p class="text-body-secondary mb-0">Pagos Pendientes</p>
          </c-card-body>
        </c-card>
      </c-col>
      <c-col md="3">
        <c-card class="text-center">
          <c-card-body>
            <h4 class="text-info">{{ paymentStats.pagosAprobados }}</h4>
            <p class="text-body-secondary mb-0">Pagos Aprobados</p>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Acciones principales -->
    <c-row class="mb-4">
      <c-col md="6">
        <c-card class="h-100">
          <c-card-body class="d-flex flex-column">
            <div class="text-center mb-3">
              <span style="font-size: 3rem;">➕</span>
            </div>
            <h5 class="card-title text-center">Realizar Nuevo Pago</h5>
            <p class="card-text text-center text-body-secondary flex-grow-1">
              Paga tu cuota mensual o anual de manera segura con MercadoPago
            </p>
            <button 
              cButton 
              color="primary" 
              class="w-100"
              routerLink="/pagos/realizar-pago">
              💳 Realizar Pago
            </button>
          </c-card-body>
        </c-card>
      </c-col>
      <c-col md="6">
        <c-card class="h-100">
          <c-card-body class="d-flex flex-column">
            <div class="text-center mb-3">
              <span style="font-size: 3rem;">📋</span>
            </div>
            <h5 class="card-title text-center">Historial de Pagos</h5>
            <p class="card-text text-center text-body-secondary flex-grow-1">
              Consulta todos tus pagos realizados y su estado actual
            </p>
            <button 
              cButton 
              color="info" 
              variant="outline"
              class="w-100"
              routerLink="/pagos/historial">
              📋 Ver Historial
            </button>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Último pago -->
    <c-row *ngIf="paymentStats?.ultimoPago">
      <c-col xs="12">
        <c-card>
          <c-card-header>
            <h5 class="mb-0">Último Pago Realizado</h5>
          </c-card-header>
          <c-card-body>
            <c-row>
              <c-col md="3">
                <strong>Fecha:</strong><br>
                {{ paymentStats.ultimoPago.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
              </c-col>
              <c-col md="3">
                <strong>Monto:</strong><br>
                \${{ paymentStats.ultimoPago.monto | number:'1.2-2' }}
              </c-col>
              <c-col md="3">
                <strong>Período:</strong><br>
                {{ paymentStats.ultimoPago.tipoPeriodo | titlecase }}
              </c-col>
              <c-col md="3">
                <strong>Estado:</strong><br>
                <c-badge [color]="getStatusColor(paymentStats.ultimoPago.estado)">
                  {{ getStatusText(paymentStats.ultimoPago.estado) }}
                </c-badge>
              </c-col>
            </c-row>
            <div class="mt-3">
              <button 
                cButton 
                color="primary" 
                variant="outline" 
                size="sm"
                [routerLink]="['/pagos/pago', paymentStats.ultimoPago._id]">
                Ver Detalle
              </button>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Alertas de pagos pendientes -->
    <c-row *ngIf="hasPendingPayments">
      <c-col xs="12">
        <c-card class="border-warning">
          <c-card-body>
            <div class="d-flex align-items-center">
              <span class="text-warning me-3" style="font-size: 2rem;">⚠️</span>
              <div class="flex-grow-1">
                <h6 class="mb-1">Tienes pagos pendientes</h6>
                <p class="mb-0 text-body-secondary">
                  Hay {{ pendingPaymentsCount }} pago(s) pendiente(s) de procesamiento.
                </p>
              </div>
              <button 
                cButton 
                color="warning" 
                variant="outline"
                routerLink="/pagos/historial"
                [queryParams]="{estado: 'pendiente'}">
                Ver Pendientes
              </button>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Loading -->
    <c-row *ngIf="loading" class="justify-content-center">
      <c-col xs="auto">
        <c-spinner color="primary"></c-spinner>
      </c-col>
    </c-row>
  `
})
export class PagosComponent implements OnInit {
  private pagoService = inject(PagoService);
  private categoriaService = inject(CategoriaEscuelaService);

  paymentStats: any = null;
  hasPendingPayments = false;
  pendingPaymentsCount = 0;
  loading = true;

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading = true;

    // Cargar estadísticas de pagos
    this.pagoService.getPaymentStats().subscribe({
      next: (response) => {
        this.paymentStats = response.data;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });

    // Verificar pagos pendientes
    this.pagoService.hasPendingPayments().subscribe({
      next: (response) => {
        this.hasPendingPayments = response.data.hasPending;
        this.pendingPaymentsCount = response.data.count;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al verificar pagos pendientes:', error);
        this.loading = false;
      }
    });
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
}
