import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CuotaStats {
  totalCuotas: number;
  cuotasPendientes: number;
  cuotasPagas: number;
  cuotasVencidas: number;
  cuotasPorMes: { mes: string; pagadas: number; pendientes: number }[];
  montoTotal: number;
  montoPendiente: number;
}

export interface Cuota {
  _id: string;
  alumno_categoria_id: string;
  mes: string;
  anio: number;
  monto: number;
  estado: 'PENDIENTE' | 'PAGA' | 'VENCIDA';
  fecha_vencimiento: Date;
  fecha_pago?: Date;
  metodo_pago?: string;
  descuento: number;
  recargo: number;
  observaciones?: string;
  comprobante_numero?: string;
  usuario_cobro?: string;
  total_a_pagar?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CuotaService {
  private apiUrl = `${environment.apiUrl}/cuotas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las cuotas con filtros y paginación
   */
  getAllCuotas(filters: any = {}, page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtener estadísticas de cuotas usando rutas existentes
   */
  getCuotaStats(): Observable<CuotaStats> {
    const currentYear = new Date().getFullYear();
    
    return forkJoin({
      pendientes: this.getCuotasByEstado('PENDIENTE'),
      pagas: this.getCuotasByEstado('PAGA'),
      vencidas: this.getCuotasVencidas(),
      porPeriodo: this.getCuotasByPeriodo(currentYear)
    }).pipe(
      map(results => this.processCuotaStats(results))
    );
  }

  /**
   * Obtener cuotas por estado (ruta existente: GET /cuotas?estado=...)
   */
  getCuotasByEstado(estado: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?estado=${estado}&page=1&limit=999`);
  }

  /**
   * Obtener cuotas vencidas (ruta existente: GET /cuotas/vencidas/buscar)
   */
  getCuotasVencidas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vencidas/buscar`);
  }

  /**
   * Obtener cuotas por período (ruta existente: GET /cuotas/periodo/buscar?anio=...)
   */
  getCuotasByPeriodo(anio: number, mes?: number): Observable<any> {
    let params = new HttpParams().set('anio', anio.toString());
    if (mes) {
      params = params.set('mes', mes.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/periodo/buscar`, { params });
  }

  /**
   * Obtener cuotas por mes del año actual
   */
  getCuotasPorMes(anio?: number): Observable<any> {
    const currentYear = anio || new Date().getFullYear();
    return this.getCuotasByPeriodo(currentYear).pipe(
      map(response => this.processCuotasPorMes(response))
    );
  }

  /**
   * Obtener cuotas pendientes del año actual
   */
  getCuotasPendientesAnioActual(): Observable<any> {
    const currentYear = new Date().getFullYear();
    return this.getCuotasByPeriodo(currentYear).pipe(
      map(response => {
        const cuotas = response.data || response.cuotas || [];
        return cuotas.filter((cuota: any) => cuota.estado === 'PENDIENTE');
      })
    );
  }

  /**
   * Procesar datos para generar estadísticas de cuotas
   */
  private processCuotaStats(results: any): CuotaStats {
    const pendientes = results.pendientes.data || results.pendientes.cuotas || [];
    const pagas = results.pagas.data || results.pagas.cuotas || [];
    const vencidas = results.vencidas.data || results.vencidas.cuotas || [];
    const porPeriodo = results.porPeriodo.data || results.porPeriodo.cuotas || [];

    const montoTotal = [...pendientes, ...pagas, ...vencidas].reduce((sum: number, cuota: any) => sum + (cuota.monto || 0), 0);
    const montoPendiente = pendientes.reduce((sum: number, cuota: any) => sum + (cuota.monto || 0), 0);

    return {
      totalCuotas: pendientes.length + pagas.length + vencidas.length,
      cuotasPendientes: pendientes.length,
      cuotasPagas: pagas.length,
      cuotasVencidas: vencidas.length,
      cuotasPorMes: this.groupCuotasByMonth(porPeriodo),
      montoTotal,
      montoPendiente
    };
  }

  /**
   * Procesar cuotas por mes
   */
  private processCuotasPorMes(response: any): any {
    const cuotas = response.data || response.cuotas || [];
    return this.groupCuotasByMonth(cuotas);
  }

  /**
   * Agrupar cuotas por mes
   */
  private groupCuotasByMonth(cuotas: any[]): { mes: string; pagadas: number; pendientes: number }[] {
    const monthGroups: { [key: string]: { pagadas: number; pendientes: number } } = {};
    
    cuotas.forEach(cuota => {
      const monthKey = `${cuota.anio}-${String(cuota.mes).padStart(2, '0')}`;
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = { pagadas: 0, pendientes: 0 };
      }
      
      if (cuota.estado === 'PAGA') {
        monthGroups[monthKey].pagadas++;
      } else if (cuota.estado === 'PENDIENTE') {
        monthGroups[monthKey].pendientes++;
      }
    });

    return Object.entries(monthGroups).map(([mes, counts]) => ({ 
      mes, 
      pagadas: counts.pagadas, 
      pendientes: counts.pendientes 
    }));
  }

  /**
   * Obtener cuota por ID
   */
  getCuotaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva cuota
   */
  createCuota(cuotaData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cuotaData);
  }

  /**
   * Actualizar cuota
   */
  updateCuota(id: string, cuotaData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cuotaData);
  }

  /**
   * Marcar cuota como pagada
   */
  marcarCuotaPagada(id: string, pagoData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/pagar`, pagoData);
  }

  /**
   * Eliminar cuota (soft delete)
   */
  deleteCuota(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
