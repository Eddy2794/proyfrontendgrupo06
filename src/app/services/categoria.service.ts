import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Categoria, 
  CreateCategoriaRequest, 
  UpdateCategoriaRequest, 
  CategoriasResponse,
  TIPOS_CATEGORIA,
  ESTADOS_CATEGORIA
} from '../models/categoria';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private baseUrl = `${environment.apiUrl}/categoria`; // Cambiado de /categorias a /categoria

  constructor(private http: HttpClient) { }

  // Métodos básicos CRUD
  getCategorias(): Observable<{success: boolean, message: string, data: CategoriasResponse}> {
    return this.http.get<{success: boolean, message: string, data: CategoriasResponse}>(this.baseUrl);
  }

  getCategoria(id: string): Observable<{success: boolean, message: string, data: Categoria}> {
    return this.http.get<{success: boolean, message: string, data: Categoria}>(`${this.baseUrl}/${id}`);
  }

  addCategoria(categoria: CreateCategoriaRequest): Observable<{success: boolean, message: string, data: Categoria}> {
    return this.http.post<{success: boolean, message: string, data: Categoria}>(this.baseUrl, categoria);
  }

  updateCategoria(id: string, categoria: UpdateCategoriaRequest): Observable<{success: boolean, message: string, data: Categoria}> {
    return this.http.put<{success: boolean, message: string, data: Categoria}>(`${this.baseUrl}/${id}`, categoria);
  }

  deleteCategoria(id: string): Observable<{success: boolean, message: string, data: any}> {
    return this.http.delete<{success: boolean, message: string, data: any}>(`${this.baseUrl}/${id}`);
  }

  // Métodos de estado
  getCategoriasActivas(): Observable<Categoria[]> {
    return this.http.get<{success: boolean, message: string, data: Categoria[]}>(`${this.baseUrl}/activas`)
      .pipe(map(response => response.data));
  }

  activateCategoria(id: string): Observable<{success: boolean, message: string, data: Categoria}> {
    return this.http.patch<{success: boolean, message: string, data: Categoria}>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateCategoria(id: string): Observable<{success: boolean, message: string, data: Categoria}> {
    return this.http.patch<{success: boolean, message: string, data: Categoria}>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  suspenderCategoria(id: string): Observable<{success: boolean, message: string, data: Categoria}> {
    return this.http.patch<{success: boolean, message: string, data: Categoria}>(`${this.baseUrl}/${id}/suspend`, {});
  }

  // Nuevos métodos específicos
  buscarPorTipo(tipo: string): Observable<Categoria[]> {
    return this.http.get<CategoriasResponse>(`${this.baseUrl}/tipo/${tipo}`)
      .pipe(map(response => response.categorias));
  }

  buscarPorEdad(edad: number): Observable<Categoria[]> {
    return this.http.get<CategoriasResponse>(`${this.baseUrl}/edad/${edad}`)
      .pipe(map(response => response.categorias));
  }

  buscarPorRangoEdad(edadMin: number, edadMax: number): Observable<Categoria[]> {
    const params = new HttpParams()
      .set('edadMin', edadMin.toString())
      .set('edadMax', edadMax.toString());
    return this.http.get<CategoriasResponse>(`${this.baseUrl}/rango-edad`, { params })
      .pipe(map(response => response.categorias));
  }

  // Método removido: buscarPorEstado - endpoint no existe en backend
  // Usar getCategoriasActivas() para obtener categorías activas

  // Métodos de precios y descuentos
  calcularPrecioConDescuento(categoria: Categoria, tipoDescuento?: string): number {
    let precio = categoria.precio.cuotaMensual;
    
    if (tipoDescuento && categoria.precio.descuentos && categoria.precio.descuentos[tipoDescuento as keyof typeof categoria.precio.descuentos]) {
      const descuento = categoria.precio.descuentos[tipoDescuento as keyof typeof categoria.precio.descuentos] || 0;
      precio = precio * (1 - descuento / 100);
    }
    
    return Math.round(precio * 100) / 100;
  }

  calcularPrecioAnual(categoria: Categoria): number {
    const precioMensual = categoria.precio.cuotaMensual;
    const descuentoAnual = categoria.precio.descuentos?.pagoAnual || 0;
    const precioAnual = precioMensual * 12;
    return Math.round(precioAnual * (1 - descuentoAnual / 100) * 100) / 100;
  }

  // Métodos de filtrado avanzado
  filtrarCategorias(filtros: {
    tipo?: string;
    estado?: string;
    edadMin?: number;
    edadMax?: number;
    precioMin?: number;
    precioMax?: number;
  }): Observable<Categoria[]> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof typeof filtros];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });
    
    return this.http.get<CategoriasResponse>(`${this.baseUrl}/filtrar`, { params })
      .pipe(map(response => response.categorias));
  }

  // Métodos de compatibilidad hacia atrás
  updateCategoriaLegacy(categoria: Categoria): Observable<{success: boolean, message: string, data: Categoria}> {
    if (!categoria._id) {
      throw new Error('ID de categoría requerido para actualización');
    }
    
    // Convertir campos legacy a nuevos campos
    const updateData: UpdateCategoriaRequest = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      edadMinima: categoria.edadMinima || categoria.edad_min,
      edadMaxima: categoria.edadMaxima || categoria.edad_max,
      estado: categoria.estado || (categoria.activa ? 'ACTIVA' : 'INACTIVA'),
      cupoMaximo: categoria.cupoMaximo || categoria.max_alumnos,
      precio: {
        cuotaMensual: categoria.precio?.cuotaMensual || categoria.cuota_mensual || 0
      }
    };
    
    return this.updateCategoria(categoria._id, updateData);
  }

  // Métodos utilitarios
  getTiposCategoria(): string[] {
    return [...TIPOS_CATEGORIA];
  }

  getEstadosCategoria(): string[] {
    return [...ESTADOS_CATEGORIA];
  }

  validarEdades(edadMin: number, edadMax: number): boolean {
    return edadMin >= 3 && edadMax <= 99 && edadMin < edadMax;
  }

  validarPrecio(precio: number): boolean {
    return precio > 0 && precio <= 999999;
  }
}