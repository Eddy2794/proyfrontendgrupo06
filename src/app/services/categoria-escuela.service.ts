import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  CategoriaEscuela, 
  CreateCategoriaEscuelaRequest, 
  UpdateCategoriaEscuelaRequest 
} from '../models/categoria-escuela.model';

export interface CategoriasResponse {
  categorias: CategoriaEscuela[];
  total: number;
  filtrosAplicados?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaEscuelaService {
  private http = inject(HttpClient);
  // Usar la ruta correcta del backend
  private apiUrl = `${environment.apiUrl}/categoria-escuela`;

  /**
   * Obtener todas las categorías de escuela
   * El token se agrega automáticamente por el interceptor HTTP
   */
  getCategorias(params?: { estado?: string }): Observable<{ data: CategoriasResponse }> {
    let httpParams = new HttpParams();
    if (params?.estado !== undefined) {
      httpParams = httpParams.set('estado', params.estado);
    }
    // No agregar headers manualmente, el interceptor se encarga
    return this.http.get<{ data: CategoriasResponse }>(this.apiUrl, { params: httpParams });
  }

  /**
   * Obtener una categoría por ID
   */
  getCategoriaById(id: string): Observable<{ data: CategoriaEscuela }> {
    return this.http.get<{ data: CategoriaEscuela }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva categoría
   */
  createCategoria(categoria: CreateCategoriaEscuelaRequest): Observable<{ data: CategoriaEscuela }> {
    return this.http.post<{ data: CategoriaEscuela }>(this.apiUrl, categoria);
  }

  /**
   * Actualizar una categoría existente
   */
  updateCategoria(id: string, categoria: UpdateCategoriaEscuelaRequest): Observable<{ data: CategoriaEscuela }> {
    return this.http.put<{ data: CategoriaEscuela }>(`${this.apiUrl}/${id}`, categoria);
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  deleteCategoria(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activar/desactivar una categoría
   */
  toggleCategoria(id: string, activo: boolean): Observable<{ data: CategoriaEscuela }> {
    const estado = activo ? 'ACTIVA' : 'INACTIVA';
    return this.updateCategoria(id, { estado });
  }
}
