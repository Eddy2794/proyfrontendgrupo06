import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Torneo } from '../models/torneo';
import { environment } from '../../environments/environment';

export interface TorneoStats {
  totalTorneos: number;
  torneosActivos: number;
  torneosFinalizados: number;
  proximosTorneos: Torneo[];
}

@Injectable({
  providedIn: 'root'
})
export class TorneoService {

  private apiUrl = `${environment.apiUrl}/torneos`; 

  constructor(private http: HttpClient) { }

  getTorneos(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/');
  }

  getTorneo(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.get(this.apiUrl + '/' + id, httpOptions);
  }

  addTorneo(torneo: Torneo): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(torneo);
    return this.http.post(this.apiUrl + '/', body, httpOption);
  }

  updateTorneo(torneo: Torneo): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(torneo);
    return this.http.put(this.apiUrl + '/' + torneo._id, body, httpOption);
  }

  deleteTorneo(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/' + id, httpOptions);
  }

  /**
   * Obtener estadísticas de torneos usando rutas existentes
   */
  getTorneoStats(): Observable<TorneoStats> {
    return this.getTorneos().pipe(
      map((response: any) => this.processTorneoStats(response))
    );
  }

  /**
   * Obtener próximos torneos (filtrados desde todos los torneos)
   */
  getProximosTorneos(limit: number = 5): Observable<any> {
    return this.getTorneos().pipe(
      map((response: any) => {
        const torneos = response.data?.docs || response.data || response.torneos || [];
        const now = new Date();
        
        // Filtrar torneos futuros y activos
        const proximosTorneos = torneos
          .filter((torneo: any) => {
            const fechaInicio = new Date(torneo.fecha_inicio);
            return fechaInicio >= now && torneo.activo;
          })
          .sort((a: any, b: any) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
          .slice(0, limit);
          
        return proximosTorneos;
      })
    );
  }

  /**
   * Obtener torneos activos (filtrados desde todos los torneos)
   */
  getTorneosActivos(): Observable<any> {
    return this.getTorneos().pipe(
      map((response: any) => {
        const torneos = response.data?.docs || response.data || response.torneos || [];
        return torneos.filter((torneo: any) => torneo.activo);
      })
    );
  }

  /**
   * Procesar datos para generar estadísticas de torneos
   */
  private processTorneoStats(response: any): TorneoStats {
    const torneos = response.data?.docs || response.data || response.torneos || [];
    const torneosActivos = torneos.filter((t: any) => t.activo);
    const torneosFinalizados = torneos.filter((t: any) => !t.activo);
    
    const now = new Date();
    const proximosTorneos = torneosActivos
      .filter((torneo: any) => {
        const fechaInicio = new Date(torneo.fecha_inicio);
        return fechaInicio >= now;
      })
      .sort((a: any, b: any) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
      .slice(0, 5);

    return {
      totalTorneos: torneos.length,
      torneosActivos: torneosActivos.length,
      torneosFinalizados: torneosFinalizados.length,
      proximosTorneos
    };
  }
}