import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlumnoCategoria, AlumnoCategoriaModel } from '../models/alumno-categoria.model';
import { environment } from '../../environments/environment';

// Interfaces para estadísticas
export interface AlumnoCategoriaStats {
  totalInscripciones: number;
  inscripcionesPorCategoria: Array<{
    categoria: string;
    cantidad: number;
  }>;
  inscripcionesPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
  inscripcionesPorDia: Array<{
    fecha: string;
    cantidad: number;
  }>;
  inscripcionesPorAno: Array<{
    ano: number;
    cantidad: number;
  }>;
  categorias: Array<{
    _id: string;
    nombre: string;
    color?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoCategoriaService {

  private apiUrl = `${environment.apiUrl}/alumno-categorias`; 

  constructor(private http: HttpClient) { }

  // Obtener todas las relaciones alumno-categoría
  getAlumnoCategorias(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno,categoria_datos')
    }
    console.log('Haciendo petición a:', this.apiUrl + '/');
    console.log('Opciones HTTP:', httpOptions);
    return this.http.get<any>(this.apiUrl + '/', httpOptions);
  }

  // Obtener una relación por ID
  getAlumnoCategoria(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_datos,categoria_datos')
    }
    return this.http.get(this.apiUrl + '/' + id, httpOptions);
  }

  // Obtener categorías de un alumno específico
  getCategoriasPorAlumno(alumnoId: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_datos,categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/alumno/' + alumnoId, httpOptions);
  }

  // Obtener alumnos de una categoría específica
  getAlumnosPorCategoria(categoriaId: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('populate', 'alumno_datos,categoria_datos')
    }
    return this.http.get<any>(this.apiUrl + '/categoria/' + categoriaId, httpOptions);
  }

  // Crear nueva relación alumno-categoría
  addAlumnoCategoria(alumnoCategoria: AlumnoCategoria): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(alumnoCategoria);
    return this.http.post(this.apiUrl + '/', body, httpOption);
  }

  // Actualizar relación alumno-categoría
  updateAlumnoCategoria(alumnoCategoria: AlumnoCategoria): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(alumnoCategoria);
    return this.http.put(this.apiUrl + '/' + alumnoCategoria._id, body, httpOption);
  }

  // Eliminar relación alumno-categoría (soft delete)
  deleteAlumnoCategoria(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/' + id, httpOptions);
  }

  // Eliminar relación alumno-categoría permanentemente
  deleteAlumnoCategoriaFisico(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/eliminar/' + id, httpOptions);
  }

  // Restaurar relación alumno-categoría
  restoreAlumnoCategoria(id: string): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    return this.http.patch(this.apiUrl + '/restaurar/' + id, {}, httpOption);
  }

  // Obtener estadísticas de inscripciones
  getInscripcionesStats(period: 'day' | 'month' | 'year' = 'month'): Observable<AlumnoCategoriaStats> {
    const httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams().set('period', period)
    };
    
    return this.http.get<AlumnoCategoriaStats>(this.apiUrl + '/stats', httpOptions);
  }
}