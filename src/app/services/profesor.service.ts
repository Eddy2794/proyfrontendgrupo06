import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
}
