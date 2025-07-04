import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cuota, CuotaModel } from '../models/cuota.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CuotaService {

  private apiUrl = `${environment.apiUrl}/cuotas`; 

  constructor(private http: HttpClient) { }

  // Obtener todas las cuotas
  getCuotas(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/', httpOptions);
  }

  // Obtener cuotas por estado
  getCuotasPorEstado(estado: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
        .set('estado', estado)
        .set('populate', 'alumno_categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/', httpOptions);
  }

  // Obtener una cuota por ID
  getCuota(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_categoria_datos')
    }
    return this.http.get(this.apiUrl + '/' + id, httpOptions);
  }

  // Obtener cuotas por alumno-categoría
  getCuotasPorAlumnoCategoria(alumnoCategoriaId: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/alumno-categoria/' + alumnoCategoriaId, httpOptions);
  }

  // Obtener cuotas por período
  getCuotasPorPeriodo(mes: string, anio: number): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
        .set('mes', mes)
        .set('anio', anio.toString())
        .set('populate', 'alumno_categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/periodo/buscar', httpOptions);
  }

  // Obtener cuotas vencidas
  getCuotasVencidas(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/vencidas/buscar', httpOptions);
  }

  // Crear nueva cuota
  addCuota(cuota: Cuota): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(cuota);
    return this.http.post(this.apiUrl + '/', body, httpOption);
  }

  // Actualizar cuota
  updateCuota(cuota: Cuota): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(cuota);
    return this.http.put(this.apiUrl + '/' + cuota._id, body, httpOption);
  }

  // Eliminar cuota
  deleteCuota(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/' + id, httpOptions);
  }

  // Eliminar cuota lógicamente (soft delete)
  softDeleteCuota(id: string): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    return this.http.patch(this.apiUrl + '/' + id + '/soft-delete', {}, httpOption);
  }

  // Restaurar cuota
  restoreCuota(id: string): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    return this.http.patch(this.apiUrl + '/' + id + '/restore', {}, httpOption);
  }

  // Marcar cuota como pagada
  marcarComoPagada(id: string, datosPago: {
    fecha_pago: Date;
    metodo_pago: string;
    comprobante_numero?: string;
    observaciones?: string;
  }): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(datosPago);
    return this.http.patch(this.apiUrl + '/' + id + '/pagar', body, httpOption);
  }

  // Obtener cuotas pendientes del año actual
  getCuotasPendientesAnioActual(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
        .set('estado', 'PENDIENTE')
        .set('year', new Date().getFullYear().toString())
        .set('populate', 'alumno_categoria_datos')
    };
    return this.http.get<any>(this.apiUrl + '/', httpOptions);
  }

  // Obtener estadísticas de cuotas por mes
  getCuotasPorMes(): Observable<any> {
    // Obtener todas las cuotas y procesarlas localmente
    return this.getCuotas().pipe(
      map((response: any) => this.processCuotasPorMes(response))
    );
  }

  /**
   * Procesar datos de cuotas para obtener estadísticas por mes
   */
  private processCuotasPorMes(response: any): any {
    const cuotas = response.data || [];
    
    return {
      success: true,
      data: {
        cuotasPorMes: this.groupByMonth(cuotas, 'fecha_vencimiento')
      }
    };
  }

  /**
   * Agrupar datos por mes
   */
  private groupByMonth(items: any[], dateField: string): Array<{mes: string, cantidad: number}> {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const currentYear = new Date().getFullYear();
    const monthCounts = new Array(12).fill(0);
    
    items.forEach(item => {
      if (item[dateField]) {
        const date = new Date(item[dateField]);
        if (date.getFullYear() === currentYear) {
          monthCounts[date.getMonth()]++;
        }
      }
    });
    
    return monthNames.map((mes, index) => ({
      mes,
      cantidad: monthCounts[index]
    }));
  }
}