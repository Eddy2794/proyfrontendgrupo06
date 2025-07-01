import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfesorCategoriaService {

  constructor(private http: HttpClient) { }

  getProfesorCategorias() {
    return this.http.get<any[]>(`${environment.apiUrl}/profesores-categorias`);
  } 

  getProfesorCategoria(id: string) {
    return this.http.get<any>(`${environment.apiUrl}/profesores-categorias/${id}`);
  }

  createProfesorCategoria(profesorCategoria: any) {
    return this.http.post<any>(`${environment.apiUrl}/profesores-categorias`, profesorCategoria);
  }   

  updateProfesorCategoria(id: string, profesorCategoria: any) {
    return this.http.put<any>(`${environment.apiUrl}/profesores-categorias/${id}`, profesorCategoria);
  }

  deleteProfesorCategoria(id: string) {
    return this.http.delete<any>(`${environment.apiUrl}/profesores-categorias/${id}`);
  }

  getProfesoresCategoriasByProfesorId(profesorId: string) {
    return this.http.get<any>(`${environment.apiUrl}/profesores-categorias/profesor/${profesorId}`);
  }

  getProfesoresCategoriasByCategoriaId(categoriaId: string) {
    return this.http.get<any>(`${environment.apiUrl}/profesores-categorias/categoria/${categoriaId}`);
  }
}
