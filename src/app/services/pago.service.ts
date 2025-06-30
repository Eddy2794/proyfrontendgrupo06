import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Pago, 
  CreatePaymentPreferenceRequest, 
  PaymentPreferenceResponse 
} from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pagos`;

  /**
   * Crear preferencia de pago de cuota mensual
   */
  createCuotaPreference(request: { categoriaId: string; periodo: { mes: number; anio: number }; descuentoTipo?: string; redirectUrls?: any }): Observable<{ data: PaymentPreferenceResponse }> {
    return this.http.post<{ data: PaymentPreferenceResponse }>(`${this.apiUrl}/cuota`, request);
  }

  /**
   * Crear preferencia de pago anual
   */
  createAnualPreference(request: { categoriaId: string; anio: number; redirectUrls?: any }): Observable<{ data: PaymentPreferenceResponse }> {
    return this.http.post<{ data: PaymentPreferenceResponse }>(`${this.apiUrl}/anual`, request);
  }

  /**
   * Obtener el estado de un pago por ID
   */
  getPaymentStatus(paymentId: string): Observable<{ data: Pago }> {
    return this.http.get<{ data: Pago }>(`${this.apiUrl}/${paymentId}`);
  }

  /**
   * Obtener el historial de pagos del usuario actual
   */
  getMyPayments(params?: { 
    estado?: string; 
    tipoPeriodo?: string; 
    page?: number; 
    limit?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<{ 
    data: Pago[]; 
    pagination: { 
      page: number; 
      limit: number; 
      total: number; 
      pages: number; 
    } 
  }> {
    let httpParams = new HttpParams();
    
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.tipoPeriodo) httpParams = httpParams.set('tipoPeriodo', params.tipoPeriodo);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    
    return this.http.get<{ 
      data: Pago[]; 
      pagination: { page: number; limit: number; total: number; pages: number; } 
    }>(`${this.apiUrl}/historial`, { params: httpParams });
  }

  /**
   * Obtener un pago específico por ID
   */
  getPayment(paymentId: string): Observable<{ data: Pago }> {
    return this.http.get<{ data: Pago }>(`${this.apiUrl}/${paymentId}`);
  }

  /**
   * Cancelar un pago pendiente
   */
  cancelPayment(paymentId: string): Observable<{ data: Pago }> {
    return this.http.post<{ data: Pago }>(`${this.apiUrl}/${paymentId}/cancel`, {});
  }

  /**
   * Obtener estadísticas de pagos del usuario
   */
  getPaymentStats(): Observable<{ 
    data: { 
      totalPagos: number; 
      montoTotal: number; 
      pagosPendientes: number; 
      pagosAprobados: number; 
      ultimoPago?: Pago; 
    } 
  }> {
    return this.http.get<{ 
      data: { 
        totalPagos: number; 
        montoTotal: number; 
        pagosPendientes: number; 
        pagosAprobados: number; 
        ultimoPago?: Pago; 
      } 
    }>(`${this.apiUrl}/stats`);
  }

  /**
   * Verificar si el usuario tiene pagos pendientes
   */
  hasPendingPayments(): Observable<{ data: { hasPending: boolean; count: number } }> {
    return this.http.get<{ data: { hasPending: boolean; count: number } }>(`${this.apiUrl}/pending-check`);
  }
}
