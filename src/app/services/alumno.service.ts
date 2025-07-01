import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AlumnoStats {
  totalAlumnos: number;
  alumnosPorMes: { mes: string; cantidad: number }[];
  alumnosActivos: number;
  alumnosInactivos: number;
}

export interface Alumno {
  _id: string;
  persona: any;
  numero_socio: string;
  fecha_inscripcion: Date;
  estado: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private apiUrl = `${environment.apiUrl}/alumnos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los alumnos con filtros y paginación
   */
  getAllAlumnos(filters: any = {}, page: number = 1, limit: number = 10): Observable<any> {
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
   * Obtener estadísticas de alumnos usando rutas existentes
   */
  getAlumnoStats(): Observable<AlumnoStats> {
    // Usar la ruta GET /alumnos con filtros para obtener estadísticas
    return this.getAllAlumnos({}, 1, 999).pipe(
      map((response: any) => this.processAlumnoStats(response))
    );
  }

  /**
   * Obtener alumnos registrados por mes (calculado desde datos existentes)
   */
  getAlumnosPorMes(): Observable<any> {
    return this.getAllAlumnos({}, 1, 999).pipe(
      map((response: any) => this.processAlumnosPorMes(response))
    );
  }

  /**
   * Procesar respuesta para generar estadísticas
   */
  private processAlumnoStats(response: any): AlumnoStats {
    const alumnos = response.data?.docs || response.data || response.alumnos || [];
    const activos = alumnos.filter((a: any) => a.estado === 'ACTIVO');
    const inactivos = alumnos.filter((a: any) => a.estado === 'INACTIVO');
    
    return {
      totalAlumnos: alumnos.length,
      alumnosActivos: activos.length,
      alumnosInactivos: inactivos.length,
      alumnosPorMes: this.groupByMonth(alumnos, 'fecha_inscripcion')
    };
  }

  /**
   * Procesar datos para gráfico por mes
   */
  private processAlumnosPorMes(response: any): any {
    const alumnos = response.data?.docs || response.data || response.alumnos || [];
    return this.groupByMonth(alumnos, 'fecha_inscripcion');
  }

  /**
   * Agrupar datos por mes
   */
  private groupByMonth(items: any[], dateField: string): { mes: string; cantidad: number }[] {
    const monthGroups: { [key: string]: number } = {};
    
    items.forEach(item => {
      if (item[dateField]) {
        const date = new Date(item[dateField]);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthGroups[monthKey] = (monthGroups[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthGroups).map(([mes, cantidad]) => ({ mes, cantidad }));
  }

  /**
   * Obtener alumno por ID
   */
  getAlumnoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo alumno
   */
  createAlumno(alumnoData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, alumnoData);
  }

  /**
   * Actualizar alumno
   */
  updateAlumno(id: string, alumnoData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, alumnoData);
  }

  /**
   * Eliminar alumno (soft delete)
   */
  deleteAlumno(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
