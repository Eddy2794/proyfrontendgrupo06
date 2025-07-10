import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { 
  CardModule, 
  GridModule, 
  ButtonModule,
  BadgeModule,
  SpinnerModule,
  TableModule,
  FormModule
} from '@coreui/angular';

import { PagoService } from '../../../services/pago.service';
import { AuthService } from '../../../services/auth.service';
import { Pago } from '../../../models';

@Component({
  selector: 'app-historial-pagos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    GridModule,
    ButtonModule,
    BadgeModule,
    SpinnerModule,
    TableModule,
    FormModule
  ],
  template: `
    <c-row>
      <c-col xs="12">
        <c-card>
          <c-card-header>
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <button 
                  cButton 
                  variant="ghost" 
                  color="secondary" 
                  size="sm"
                  class="me-3"
                  routerLink="/pagos">
                  ⬅️
                </button>
                <h4 class="mb-0">📋 Historial de Pagos</h4>
              </div>
              <button 
                cButton 
                color="primary" 
                size="sm"
                routerLink="/pagos/realizar-pago">
                ➕ Nuevo Pago
              </button>
            </div>
          </c-card-header>
          <c-card-body>
            <!-- Filtros -->
            <form [formGroup]="filterForm" class="mb-4">
              <c-row>
                <c-col md="4">
                  <label cLabel for="estado">Estado:</label>
                  <select 
                    cSelect 
                    id="estado" 
                    formControlName="estado"
                    (change)="onFilterChange()">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="procesando">Procesando</option>
                  </select>
                </c-col>
                <c-col md="4">
                  <label cLabel for="tipoPeriodo">Tipo de Período:</label>
                  <select 
                    cSelect 
                    id="tipoPeriodo" 
                    formControlName="tipoPeriodo"
                    (change)="onFilterChange()">
                    <option value="">Todos los períodos</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </c-col>
                <c-col md="4" class="d-flex align-items-end">
                  <button 
                    cButton 
                    color="secondary" 
                    variant="outline"
                    (click)="clearFilters()">
                    🗑️ Limpiar Filtros
                  </button>
                </c-col>
              </c-row>
            </form>

            <!-- Tabla de pagos -->
            <div class="table-responsive" *ngIf="!loading; else loadingTemplate">
              <table cTable hover *ngIf="pagos.length > 0; else noDataTemplate">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Período</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let pago of pagos">
                    <td>
                      <div>
                        <strong>{{ pago.fechaCreacion | date:'dd/MM/yyyy' }}</strong><br>
                        <small class="text-body-secondary">{{ pago.fechaCreacion | date:'HH:mm' }}</small>
                      </div>
                    </td>
                    <td>
                      <strong>\${{ pago.monto | number:'1.2-2' }}</strong>
                    </td>
                    <td>
                      <span class="text-capitalize">{{ pago.tipoPeriodo }}</span>
                    </td>
                    <td>
                      <span class="text-body-secondary">{{ getCategoriaName(pago.categoria) }}</span>
                    </td>
                    <td>
                      <c-badge [color]="getStatusColor(pago.estado)">
                        {{ getStatusText(pago.estado) }}
                      </c-badge>
                    </td>
                    <td>
                      <button 
                        cButton 
                        color="primary" 
                        variant="outline" 
                        size="sm"
                        [routerLink]="['/pagos/pago', pago._id]">
                        👁️ Ver Detalle
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginación simplificada -->
            <c-row *ngIf="totalPages > 1" class="mt-4">
              <c-col xs="12" class="d-flex justify-content-center">
                <div class="btn-group" role="group">
                  <button 
                    cButton 
                    color="secondary" 
                    variant="outline"
                    [disabled]="currentPage === 1"
                    (click)="onPageChange(currentPage - 1)">
                    ⬅️ Anterior
                  </button>
                  <span class="btn btn-secondary">{{ currentPage }} / {{ totalPages }}</span>
                  <button 
                    cButton 
                    color="secondary" 
                    variant="outline"
                    [disabled]="currentPage === totalPages"
                    (click)="onPageChange(currentPage + 1)">
                    Siguiente ➡️
                  </button>
                </div>
              </c-col>
            </c-row>

            <!-- Resumen de resultados -->
            <div *ngIf="!loading && pagos.length > 0" class="mt-3">
              <small class="text-body-secondary">
                Mostrando {{ pagos.length }} de {{ totalItems }} pagos
                <span *ngIf="isFiltered"> (filtrados)</span>
              </small>
            </div>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>

    <!-- Template de carga -->
    <ng-template #loadingTemplate>
      <div class="text-center p-4">
        <c-spinner color="primary"></c-spinner>
        <p class="mt-2 text-body-secondary">Cargando historial de pagos...</p>
      </div>
    </ng-template>

    <!-- Template sin datos -->
    <ng-template #noDataTemplate>
      <div class="text-center p-4">
        <span style="font-size: 4rem;">📭</span>
        <h5 class="mt-3">No hay pagos para mostrar</h5>
        <p class="text-body-secondary mb-4">
          <span *ngIf="isFiltered">No se encontraron pagos con los filtros aplicados.</span>
          <span *ngIf="!isFiltered">Aún no has realizado ningún pago.</span>
        </p>
        <button 
          cButton 
          color="primary"
          *ngIf="!isFiltered"
          routerLink="/pagos/realizar-pago">
          💳 Realizar Primer Pago
        </button>
        <button 
          cButton 
          color="secondary"
          variant="outline"
          *ngIf="isFiltered"
          (click)="clearFilters()">
          🗑️ Limpiar Filtros
        </button>
      </div>
    </ng-template>
  `
})
export class HistorialPagosComponent implements OnInit {
  private pagoService = inject(PagoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  pagos: Pago[] = [];
  loading = true;
  
  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 10;
  
  // Filtros
  filterForm: FormGroup;
  isFiltered = false;

  constructor() {
    this.filterForm = this.fb.group({
      estado: [''],
      tipoPeriodo: ['']
    });
  }

  async ngOnInit() {
    console.log('🔄 Iniciando historial de pagos...');
    
    try {
      // Verificar autenticación antes de proceder
      const isAuth = await this.authService.isAuthenticated();
      console.log('📋 Estado de autenticación:', isAuth);
      
      // Log del token actual para depuración
      const currentToken = this.authService.token;
      console.log('🔑 Token actual:', currentToken ? `${currentToken.substring(0, 20)}...` : 'No hay token');
      
      // Log del usuario actual
      const currentUser = this.authService.currentUser;
      console.log('👤 Usuario actual:', currentUser?.username || 'No definido');
      
      // Verificar localStorage también
      const storedToken = localStorage.getItem('token');
      console.log('💾 Token en localStorage:', storedToken ? `${storedToken.substring(0, 20)}...` : 'No hay token');
      
      if (!isAuth) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo al login');
        this.router.navigate(['/login']);
        return;
      }

      // Verificar si hay filtros en los query params
      this.route.queryParams.subscribe(params => {
        if (params['estado']) {
          this.filterForm.patchValue({ estado: params['estado'] });
        }
        if (params['tipoPeriodo']) {
          this.filterForm.patchValue({ tipoPeriodo: params['tipoPeriodo'] });
        }
        this.loadPagos();
      });
    } catch (error) {
      console.error('❌ Error en ngOnInit:', error);
      this.loading = false;
    }
  }

  loadPagos() {
    console.log('🔄 Iniciando carga de pagos...');
    
    // Verificar autenticación antes de hacer la solicitud
    const currentToken = this.authService.token;
    const currentUser = this.authService.currentUser;
    
    console.log('🔐 Verificación previa a la solicitud:');
    console.log('  - Token presente:', !!currentToken);
    console.log('  - Usuario presente:', !!currentUser);
    console.log('  - Username:', currentUser?.username || 'No definido');
    
    if (!currentToken) {
      console.error('❌ No hay token disponible para la solicitud');
      this.router.navigate(['/login']);
      return;
    }
    
    this.loading = true;
    
    const filters = this.filterForm.value;
    const queryParams: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Agregar filtros si están presentes
    if (filters.estado) {
      queryParams.estado = filters.estado;
    }
    if (filters.tipoPeriodo) {
      queryParams.tipoPeriodo = filters.tipoPeriodo;
    }

    console.log('📋 Parámetros de consulta:', queryParams);
    console.log('🌐 Realizando solicitud a /api/pagos/historial...');
    this.isFiltered = !!(filters.estado || filters.tipoPeriodo);

    this.pagoService.getMyPayments(queryParams).subscribe({
      next: (response) => {
        console.log('✅ Respuesta exitosa del servidor:', response);
        this.pagos = response.data || [];
        this.totalItems = response.pagination?.total || 0;
        this.totalPages = response.pagination?.pages || 1;
        this.loading = false;
        console.log('📊 Pagos cargados exitosamente:', this.pagos.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar pagos:', error);
        console.error('📝 Detalles completos del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error,
          headers: error.headers
        });
        
        // Manejo específico para error 401
        if (error.status === 401) {
          console.warn('🔒 Token expirado o inválido, limpiando sesión...');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        
        this.loading = false;
        this.pagos = [];
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadPagos();
  }

  clearFilters() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadPagos();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadPagos();
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

  getCategoriaName(categoria: string | any): string {
    if (typeof categoria === 'string') {
      return categoria || 'No especificada';
    }
    return categoria?.nombre || 'No especificada';
  }
}
