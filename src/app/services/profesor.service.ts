import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProfesorStats {
  totalProfesores: number;
  profesoresActivos: number;
  profesoresInactivos: number;
  profesoresPorMes: { mes: string; cantidad: number }[];
}

export interface Profesor {
  _id: string;
  persona: any;
  titulo: string;
  experiencia_anios: number;
  fecha_contratacion: Date;
  salario: number;
  activo_laboral: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {

  constructor(private http: HttpClient) { }

  getProfesores() {
    return this.http.get(`${environment.apiUrl}/profesores`);
  }

  getProfesor(id: string) {
    return this.http.get(`${environment.apiUrl}/profesores/${id}`);
  }

  createProfesor(profesor: any) {
    console.log('profesor', profesor);
    return this.http.post(`${environment.apiUrl}/profesores`, profesor);
  }
  updateProfesor(id: string, profesor: any) {
    return this.http.put(`${environment.apiUrl}/profesores/${id}`, profesor);
  }
  deleteProfesor(id: string) {
    return this.http.delete(`${environment.apiUrl}/profesores/${id}`);
  }

  validateEmailUnique(email: string, excludeId?: string) {
    return this.http.get(`${environment.apiUrl}/profesores/validate-email`, {
      params: { email, excludeId: excludeId || '' }
    });
  }

  /**
   * Obtener estadísticas de profesores usando rutas existentes
   */
  getProfesorStats(): Observable<ProfesorStats> {
    return this.getAllProfesores({}, 1, 999).pipe(
      map((response: any) => this.processProfesorStats(response))
    );
  }

  /**
   * Obtener profesores registrados por mes (calculado desde datos existentes)
   */
  getProfesoresPorMes(): Observable<any> {
    return this.getAllProfesores({}, 1, 999).pipe(
      map((response: any) => this.processProfesoresPorMes(response))
    );
  }

  /**
   * Obtener profesores activos (filtrados desde todos los profesores)
   */
  getProfesoresActivos(): Observable<any> {
    return this.getAllProfesores({}, 1, 999).pipe(
      map((response: any) => {
        const profesores = response.data?.docs || response.data || response.profesores || [];
        return profesores.filter((profesor: any) => profesor.activo_laboral);
      })
    );
  }

  /**
   * Procesar respuesta para generar estadísticas de profesores
   */
  private processProfesorStats(response: any): ProfesorStats {
    const profesores = response.data?.docs || response.data || response.profesores || [];
    const activos = profesores.filter((p: any) => p.activo_laboral);
    const inactivos = profesores.filter((p: any) => !p.activo_laboral);
    
    return {
      totalProfesores: profesores.length,
      profesoresActivos: activos.length,
      profesoresInactivos: inactivos.length,
      profesoresPorMes: this.groupByMonth(profesores, 'fecha_contratacion')
    };
  }

  /**
   * Procesar datos para gráfico de profesores por mes
   */
  private processProfesoresPorMes(response: any): any {
    const profesores = response.data?.docs || response.data || response.profesores || [];
    return this.groupByMonth(profesores, 'fecha_contratacion');
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
   * Obtener todos los profesores con filtros y paginación
   */
  getAllProfesores(filters: any = {}, page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<any>(`${environment.apiUrl}/profesores`, { params });
  }
}
