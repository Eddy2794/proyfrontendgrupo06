import { Component, OnInit, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  CardModule, 
  GridModule, 
  ButtonModule,
  FormModule,
  AlertModule,
  SpinnerModule
} from '@coreui/angular';

import { PagoService } from '../../../services/pago.service';
import { CategoriaEscuelaService } from '../../../services/categoria-escuela.service';
import { MercadoPagoService } from '../../../services/mercadopago.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfigService } from '../../../services/config.service';
import { CategoriaEscuela, CreatePaymentPreferenceRequest, PaymentPreferenceResponse } from '../../../models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-realizar-pago',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    GridModule,
    ButtonModule,
    FormModule,
    AlertModule,
    SpinnerModule
  ],
  template: `
    <c-row>
      <c-col lg="8" class="mx-auto">
        <c-card>
          <c-card-header>
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
              <h4 class="mb-0">💳 Realizar Pago</h4>
            </div>
          </c-card-header>
          <c-card-body>
            <!-- Paso 1: Selección de categoría y período -->
            <div *ngIf="currentStep === 1">
              <h5>Paso 1: Selecciona tu categoría y período</h5>
              
              <form [formGroup]="paymentForm" (ngSubmit)="onStepOne()">
                <!-- Selección de categoría -->
                <div class="mb-3">
                  <label for="categoria" class="form-label">Categoría de Escuela</label>
                  <select 
                    class="form-select"
                    id="categoria"
                    formControlName="categoriaEscuelaId">
                    <option value="">Selecciona una categoría</option>
                    <option 
                      *ngFor="let categoria of categorias" 
                      [value]="categoria._id">
                      {{ categoria.nombre }} - \${{ categoria.precio | number:'1.2-2' }}
                      <span *ngIf="categoria.descuento"> ({{ categoria.descuento }}% descuento)</span>
                    </option>
                  </select>
                  <div *ngIf="paymentForm.get('categoriaEscuelaId')?.invalid && paymentForm.get('categoriaEscuelaId')?.touched" 
                       class="text-danger small mt-1">
                    Selecciona una categoría
                  </div>
                </div>

                <!-- Información de la categoría seleccionada -->
                <c-card *ngIf="selectedCategoria" class="mb-3 border-info">
                  <c-card-body>
                    <h6>{{ selectedCategoria.nombre }}</h6>
                    <p class="text-body-secondary mb-2">{{ selectedCategoria.descripcion }}</p>
                    <div class="row">
                      <div class="col-md-6">
                        <small><strong>Edad:</strong> {{ selectedCategoria.edadMinima }} - {{ selectedCategoria.edadMaxima }} años</small>
                      </div>
                      <div class="col-md-6">
                        <small><strong>Precio base:</strong> \${{ selectedCategoria.precio | number:'1.2-2' }}</small>
                      </div>
                    </div>
                  </c-card-body>
                </c-card>

                <!-- Selección de período -->
                <div class="mb-3">
                  <label class="form-label">Período de Pago</label>
                  <div class="mt-2">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="tipoPeriodo"
                        value="mensual"
                        formControlName="tipoPeriodo"
                        id="mensual">
                      <label class="form-check-label" for="mensual">
                        <strong>Mensual</strong>
                        <span *ngIf="selectedCategoria">
                          - \${{ calculateAmount('mensual') | number:'1.2-2' }}
                        </span>
                      </label>
                    </div>
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="tipoPeriodo"
                        value="anual"
                        formControlName="tipoPeriodo"
                        id="anual">
                      <label class="form-check-label" for="anual">
                        <strong>Anual</strong>
                        <span *ngIf="selectedCategoria">
                          - \${{ calculateAmount('anual') | number:'1.2-2' }}
                          <small class="text-success ms-2">(Ahorro del 10%)</small>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div *ngIf="paymentForm.get('tipoPeriodo')?.invalid && paymentForm.get('tipoPeriodo')?.touched" 
                       class="text-danger small mt-1">
                    Selecciona un período de pago
                  </div>
                </div>

                <div class="d-grid">
                  <button 
                    cButton 
                    color="primary" 
                    type="submit"
                    [disabled]="paymentForm.invalid || loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Continuar
                  </button>
                </div>
              </form>
            </div>

            <!-- Paso 2: Confirmación y pago -->
            <div *ngIf="currentStep === 2">
              <h5>Paso 2: Confirma tu pago</h5>
              
              <!-- Resumen del pago -->
              <c-card class="mb-4 border-success">
                <c-card-header class="bg-light">
                  <h6 class="mb-0">Resumen del Pago</h6>
                </c-card-header>
                <c-card-body>
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Categoría:</strong> {{ selectedCategoria?.nombre }}</p>
                      <p><strong>Período:</strong> {{ paymentForm.get('tipoPeriodo')?.value | titlecase }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Precio base:</strong> \${{ selectedCategoria?.precio | number:'1.2-2' }}</p>
                      <p *ngIf="selectedCategoria?.descuento">
                        <strong>Descuento:</strong> {{ selectedCategoria.descuento }}%
                      </p>
                      <p *ngIf="paymentForm.get('tipoPeriodo')?.value === 'anual'">
                        <strong>Descuento anual:</strong> 10%
                      </p>
                      <h5 class="text-success">
                        <strong>Total a pagar: \${{ calculateFinalAmount() | number:'1.2-2' }}</strong>
                      </h5>
                    </div>
                  </div>
                </c-card-body>
              </c-card>

              <!-- Opciones de pago -->
              <div class="mb-4">
                <h6>Método de Pago</h6>
                <div class="row">
                  <div class="col-md-6">
                    <button 
                      cButton 
                      color="primary" 
                      class="w-100 mb-2"
                      [disabled]="loading"
                      (click)="createPaymentPreference()">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      💳 Pagar con MercadoPago
                    </button>
                  </div>
                </div>
              </div>

              <!-- Botón checkout de MercadoPago -->
              <div id="mercadopago-button" #mercadopagoButton class="mb-3"></div>

              <div class="d-flex gap-2">
                <button 
                  cButton 
                  color="secondary" 
                  variant="outline"
                  (click)="goToPreviousStep()">
                  Volver
                </button>
              </div>
            </div>

            <!-- Mensajes de error -->
            <c-alert 
              *ngIf="errorMessage" 
              color="danger" 
              [dismissible]="true"
              (visibleChange)="errorMessage = $event ? errorMessage : ''">
              {{ errorMessage }}
            </c-alert>

            <!-- Mensaje de éxito -->
            <c-alert 
              *ngIf="successMessage" 
              color="success" 
              [dismissible]="true">
              ✅ {{ successMessage }}
            </c-alert>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class RealizarPagoComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pagoService = inject(PagoService);
  private categoriaService = inject(CategoriaEscuelaService);
  private mercadopagoService = inject(MercadoPagoService);
  private notificationService = inject(NotificationService);
  private configService = inject(ConfigService);

  @ViewChild('mercadopagoButton', { static: false }) mercadopagoButton!: ElementRef;

  currentStep = 1;
  loading = false;
  errorMessage = '';
  successMessage = '';

  categorias: CategoriaEscuela[] = [];
  selectedCategoria: CategoriaEscuela | null = null;
  paymentPreference: PaymentPreferenceResponse | null = null;

  paymentForm: FormGroup = this.fb.group({
    categoriaEscuelaId: ['', Validators.required],
    tipoPeriodo: ['', Validators.required]
  });

  ngOnInit() {
    this.loadCategorias();
    this.setupFormSubscriptions();
  }

  ngAfterViewInit() {
    // Inicializar MercadoPago cuando se necesite
  }

  private loadCategorias() {
    this.loading = true;
    this.categoriaService.getCategorias({ activo: true }).subscribe({
      next: (response) => {
        this.categorias = response.data?.categorias || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las categorías';
        this.loading = false;
      }
    });
  }

  private setupFormSubscriptions() {
    this.paymentForm.get('categoriaEscuelaId')?.valueChanges.subscribe(value => {
      this.selectedCategoria = this.categorias.find(c => c._id === value) || null;
    });
  }

  calculateAmount(tipoPeriodo: string): number {
    if (!this.selectedCategoria) return 0;
    
    let monto = this.selectedCategoria.precio;
    
    // Aplicar descuento de categoría
    if (this.selectedCategoria.descuento) {
      monto = monto * (1 - this.selectedCategoria.descuento / 100);
    }
    
    // Aplicar descuento anual
    if (tipoPeriodo === 'anual') {
      monto = monto * 12 * 0.9; // 10% descuento anual
    }
    
    return monto;
  }

  calculateFinalAmount(): number {
    const tipoPeriodo = this.paymentForm.get('tipoPeriodo')?.value;
    return this.calculateAmount(tipoPeriodo);
  }

  onStepOne() {
    if (this.paymentForm.valid) {
      this.currentStep = 2;
      this.errorMessage = '';
    }
  }

  goToPreviousStep() {
    this.currentStep = 1;
    this.paymentPreference = null;
  }

  async createPaymentPreference() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const request: CreatePaymentPreferenceRequest = {
        categoriaEscuelaId: this.paymentForm.get('categoriaEscuelaId')?.value,
        tipoPeriodo: this.paymentForm.get('tipoPeriodo')?.value,
        redirectUrls: this.configService.getRedirectUrls()
      };

      this.pagoService.createPaymentPreference(request).subscribe({
        next: async (response) => {
          this.paymentPreference = response.data;
          
          // Inicializar MercadoPago e insertar botón
          try {
            await this.mercadopagoService.initMercadoPago(environment.mercadopago.publicKey);
            
            setTimeout(() => {
              this.mercadopagoService.createPaymentButton(
                this.paymentPreference!.preferenceId,
                'mercadopago-button'
              );
            }, 100);
            
          } catch (mpError) {
            console.error('Error con MercadoPago:', mpError);
            // Fallback: abrir en nueva ventana
            if (this.paymentPreference.initPoint) {
              this.mercadopagoService.redirectToCheckout(this.paymentPreference.initPoint);
            }
          }
          
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al crear la preferencia de pago';
          this.loading = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Error inesperado';
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/pagos']);
  }
}
