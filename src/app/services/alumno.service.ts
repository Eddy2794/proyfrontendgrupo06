import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alumno, AlumnoModel } from '../models/alumno.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {

  private apiUrl = `${environment.apiUrl}/alumnos`; 

  constructor(private http: HttpClient) { }

  // Obtener todos los alumnos
  getAlumnos(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'persona_datos,tutor_datos')
    }
    return this.http.get<any>(this.apiUrl + '/', httpOptions);
  }

  // Obtener un alumno por ID
  getAlumno(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'persona_datos,tutor_datos')
    }
    return this.http.get(this.apiUrl + '/' + id, httpOptions);
  }

  // Buscar alumno por número de socio
  getAlumnoByNumeroSocio(numeroSocio: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'persona_datos,tutor_datos')
    }
    return this.http.get<any>(this.apiUrl + '/numero-socio/' + numeroSocio, httpOptions);
  }

  // Obtener alumnos por tutor
  getAlumnosByTutor(tutorId: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'persona_datos,tutor_datos')
    }
    return this.http.get<any>(this.apiUrl + '/tutor/' + tutorId, httpOptions);
  }

  // Crear nuevo alumno
  addAlumno(alumno: Alumno): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(alumno);
    return this.http.post(this.apiUrl + '/', body, httpOption);
  }

  // Actualizar alumno
  updateAlumno(alumno: Alumno): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(alumno);
    return this.http.put(this.apiUrl + '/' + alumno._id, body, httpOption);
  }

  // Eliminar alumno (soft delete)
  deleteAlumno(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/' + id, httpOptions);
  }

  // Eliminar alumno permanentemente
  deleteAlumnoFisico(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/eliminar/' + id, httpOptions);
  }

  // Restaurar alumno
  restoreAlumno(id: string): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    return this.http.patch(this.apiUrl + '/restaurar/' + id, {}, httpOption);
  }

  // Método para obtener alumnos con filtros de paginación
  getAllAlumnos(params: any = {}, page: number = 1, limit: number = 10): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('populate', 'persona_datos,tutor_datos');
    
    // Agregar parámetros adicionales
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    const httpOptions = {
      headers: new HttpHeaders(),
      params: httpParams
    };
    
    return this.http.get<any>(this.apiUrl + '/', httpOptions);
  }

  // Obtener estadísticas de alumnos por mes
  getAlumnosPorMes(): Observable<any> {
    // Obtener todos los alumnos y procesarlos localmente
    return this.getAlumnos().pipe(
      map((response: any) => this.processAlumnosPorMes(response))
    );
  }

  /**
   * Procesar datos de alumnos para obtener estadísticas por mes
   */
  private processAlumnosPorMes(response: any): any {
    const alumnos = response.data || [];
    
    return {
      success: true,
      data: {
        alumnosPorMes: this.groupByMonth(alumnos, 'fecha_inscripcion')
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