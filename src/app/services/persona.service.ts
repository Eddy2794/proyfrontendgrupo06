import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Persona } from '../models';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las personas
   */
  getAllPersonas(page: number = 1, limit: number = 10, search?: string): Observable<ApiResponse<{personas: Persona[], total: number}>> {
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<ApiResponse<{personas: Persona[], total: number}>>(`${this.apiUrl}/personas${params}`);
  }

  /**
   * Obtener persona por ID
   */
  getPersonaById(personaId: string): Observable<ApiResponse<Persona>> {
    return this.http.get<ApiResponse<Persona>>(`${this.apiUrl}/personas/${personaId}`);
  }

  /**
   * Crear nueva persona
   */
  createPersona(personaData: Partial<Persona>): Observable<ApiResponse<Persona>> {
    return this.http.post<ApiResponse<Persona>>(`${this.apiUrl}/personas`, personaData);
  }

  /**
   * Actualizar persona
   */
  updatePersona(personaId: string, personaData: Partial<Persona>): Observable<ApiResponse<Persona>> {
    return this.http.put<ApiResponse<Persona>>(`${this.apiUrl}/personas/${personaId}`, personaData);
  }

  /**
   * Eliminar persona
   */
  deletePersona(personaId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/personas/${personaId}`);
  }

  /**
   * Buscar personas por número de documento
   */
  searchByDocument(numeroDocumento: string): Observable<ApiResponse<Persona[]>> {
    return this.http.get<ApiResponse<Persona[]>>(`${this.apiUrl}/personas/search?numeroDocumento=${encodeURIComponent(numeroDocumento)}`);
  }

  /**
   * Buscar personas por email
   */
  searchByEmail(email: string): Observable<ApiResponse<Persona[]>> {
    return this.http.get<ApiResponse<Persona[]>>(`${this.apiUrl}/personas/search?email=${encodeURIComponent(email)}`);
  }

  /**
   * Buscar personas por nombre
   */
  searchByName(searchTerm: string): Observable<ApiResponse<Persona[]>> {
    return this.http.get<ApiResponse<Persona[]>>(`${this.apiUrl}/personas/search?search=${encodeURIComponent(searchTerm)}`);
  }
}
