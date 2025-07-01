import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alumno, AlumnoModel } from '../models/alumno.model';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {

  private apiUrl = 'http://localhost:3000/api/alumnos'; 

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
} 