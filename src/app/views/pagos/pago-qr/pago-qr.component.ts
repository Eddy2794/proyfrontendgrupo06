import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  CardModule, 
  GridModule, 
  ButtonModule,
  BadgeModule,
  SpinnerModule,
  AlertModule,
  FormModule
} from '@coreui/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';

import { PagoService } from '../../../services/pago.service';
import { CategoriaService } from '../../../services/categoria.service';
import { NotificationService } from '../../../services/notification.service';
import { Categoria, QRPaymentResponse } from '../../../models';

@Component({
  selector: 'app-pago-qr',
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
    AlertModule,
    FormModule,
    QRCodeComponent,
    DecimalPipe,
    CurrencyPipe
  ],
  templateUrl: './pago-qr.component.html',
  styleUrls: ['./pago-qr.component.scss']
})
export class PagoQrComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly pagoService = inject(PagoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificationService = inject(NotificationService);

  // State
  currentStep = 1;
  loading = false;
  error = '';
  
  // Data
  categorias: Categoria[] = [];
  selectedCategoria: Categoria | null = null;
  qrPayment: QRPaymentResponse | null = null;
  paymentStatus: 'pending' | 'approved' | 'rejected' | 'expired' | 'checking' = 'pending';
  
  // Timer
  private statusCheckInterval?: Subscription;
  private expirationTime?: Date;
  timeRemaining = '';

  // Form
  paymentForm: FormGroup;

  // Constants
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  anios: number[] = [];

  constructor() {
    // Generate years (current and next 2 years)
    const currentYear = new Date().getFullYear();
    this.anios = [currentYear, currentYear + 1, currentYear + 2];

    // Initialize form
    this.paymentForm = this.fb.group({
      categoriaId: ['', [Validators.required]],
      tipoPago: ['', [Validators.required]],
      mes: [''],
      anio: ['', [Validators.required]]
    });

    // Watch for category changes
    this.paymentForm.get('categoriaId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(categoriaId => {
        this.selectedCategoria = this.categorias.find(c => c._id === categoriaId) || null;
      });

    // Watch for payment type changes to set validators
    this.paymentForm.get('tipoPago')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tipo => {
        const mesControl = this.paymentForm.get('mes');
        if (tipo === 'mensual') {
          mesControl?.setValidators([Validators.required]);
        } else {
          mesControl?.clearValidators();
          mesControl?.setValue('');
        }
        mesControl?.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopStatusChecking();
  }

  async loadCategorias(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      
      const response = await this.categoriaService.getCategoriasActivas().toPromise();
      this.categorias = response || [];
      
      if (this.categorias.length === 0) {
        this.error = 'No hay categorías disponibles en este momento.';
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      this.error = 'Error al cargar las categorías. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  getCategoriaLabel(categoria: Categoria): string {
    return `${categoria.nombre} - $${categoria.precio.cuotaMensual.toFixed(2)}/mes`;
  }

  getMesNombre(mesNumero: number): string {
    return mesNumero ? this.meses[mesNumero - 1] : '';
  }

  getFinalAmount(): number {
    if (!this.selectedCategoria) return 0;
    
    const tipoPago = this.paymentForm.get('tipoPago')?.value;
    const precioMensual = this.selectedCategoria.precio.cuotaMensual;
    
    if (tipoPago === 'anual') {
      // Pago anual con 10% de descuento
      return precioMensual * 12 * 0.9;
    }
    
    return precioMensual;
  }

  getDiscount(): number {
    if (!this.selectedCategoria) return 0;
    
    const tipoPago = this.paymentForm.get('tipoPago')?.value;
    
    if (tipoPago === 'anual') {
      const precioMensual = this.selectedCategoria.precio.cuotaMensual;
      return precioMensual * 12 * 0.1; // 10% de descuento
    }
    
    return 0;
  }

  async onStepOne(): Promise<void> {
    if (!this.paymentForm.valid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    try {
      this.loading = true;
      this.error = '';

      const formData = this.paymentForm.value;
      const qrRequest = {
        categoriaId: formData.categoriaId,
        tipoPago: formData.tipoPago === 'mensual' ? 'cuota' as const : 'anual' as const,
        periodo: formData.tipoPago === 'mensual' ? 
          { mes: formData.mes, anio: formData.anio } : 
          { anio: formData.anio }
      };

      const response = await this.pagoService.createQRPayment(qrRequest).toPromise();
      this.qrPayment = response?.data || null;
      
      if (this.qrPayment) {
        this.currentStep = 2;
        this.paymentStatus = 'pending';
        
        // Set expiration time (typically 30 minutes from now)
        this.expirationTime = new Date(Date.now() + 30 * 60 * 1000);
        
        // Start checking payment status
        this.startStatusChecking();
        this.startExpirationTimer();
        
        this.notificationService.showSuccess('Código QR generado correctamente');
      }
    } catch (error: any) {
      console.error('Error creating QR payment:', error);
      this.error = error.error?.message || 'Error al generar el código QR. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  async checkPaymentStatus(): Promise<void> {
    if (!this.qrPayment) return;

    try {
      this.loading = true;
      this.paymentStatus = 'checking';

      const response = await this.pagoService.getPaymentStatus(this.qrPayment.pagoId).toPromise();
      
      if (response && response.data) {
        const estado = response.data.estado;
        this.paymentStatus = estado === 'aprobado' ? 'approved' : 
                           estado === 'rechazado' ? 'rejected' : 
                           estado === 'cancelado' ? 'rejected' : 'pending';
        
        if (estado === 'aprobado') {
          this.stopStatusChecking();
          this.notificationService.showSuccess('¡Pago aprobado exitosamente!');
          // Optionally redirect to payment details or history
          setTimeout(() => {
            this.router.navigate(['/pagos/historial']);
          }, 2000);
        } else if (estado === 'rechazado' || estado === 'cancelado') {
          this.stopStatusChecking();
          this.notificationService.showError('El pago fue rechazado');
        }
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      this.error = 'Error al verificar el estado del pago';
    } finally {
      this.loading = false;
    }
  }

  private startStatusChecking(): void {
    // Check status every 5 seconds
    this.statusCheckInterval = interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.paymentStatus === 'pending') {
          this.checkPaymentStatus();
        }
      });
  }

  private stopStatusChecking(): void {
    if (this.statusCheckInterval) {
      this.statusCheckInterval.unsubscribe();
      this.statusCheckInterval = undefined;
    }
  }

  private startExpirationTimer(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTimeRemaining();
      });
  }

  private updateTimeRemaining(): void {
    if (!this.expirationTime) {
      this.timeRemaining = '';
      return;
    }

    const now = new Date();
    const diff = this.expirationTime.getTime() - now.getTime();

    if (diff <= 0) {
      this.timeRemaining = 'Expirado';
      this.paymentStatus = 'expired';
      this.stopStatusChecking();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    this.timeRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getTimeRemaining(): string {
    return this.timeRemaining;
  }

  goBack(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.qrPayment = null;
      this.paymentStatus = 'pending';
      this.stopStatusChecking();
    } else {
      this.router.navigate(['/pagos']);
    }
  }
}
