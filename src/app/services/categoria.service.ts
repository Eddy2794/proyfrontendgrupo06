import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getCategoria(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  addCategoria(categoria: Categoria): Observable<any> {
    return this.http.post(this.apiUrl, categoria);
  }

  updateCategoria(categoria: Categoria): Observable<any> {
    return this.http.put(`${this.apiUrl}/${categoria._id}`, categoria);
  }

  deleteCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCategoriasActivas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activas`);
  }

  activateCategoria(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateCategoria(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/deactivate`, {});
  }
}