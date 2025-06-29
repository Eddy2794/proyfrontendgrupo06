import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, Persona } from '../models';

export interface UpdateProfileRequest {
  persona: Partial<Persona>;
  imagenPerfil?: string; // Imagen en base64
  configuraciones?: {
    notificaciones?: {
      email?: boolean;
      push?: boolean;
    };
    privacidad?: {
      perfilPublico?: boolean;
    };
    tema?: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtener perfil del usuario actual
   */
  getCurrentProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/profile`);
  }

  /**
   * Actualizar perfil del usuario
   */
  updateProfile(updateData: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, updateData);
  }

  /**
   * Cambiar contraseña del usuario
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/auth/change-password`, passwordData);
  }

  /**
   * Actualizar imagen de perfil
   */
  updateProfileImage(imagenPerfil: string): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/auth/profile/image`, { imagenPerfil });
  }

  /**
   * Eliminar imagen de perfil
   */
  removeProfileImage(): Observable<ApiResponse<User>> {
    return this.http.delete<ApiResponse<User>>(`${this.apiUrl}/auth/profile/image`);
  }

  /**
   * Obtener información de persona por ID
   */
  getPersonaById(personaId: string): Observable<ApiResponse<Persona>> {
    return this.http.get<ApiResponse<Persona>>(`${this.apiUrl}/persona/${personaId}`);
  }

  /**
   * Actualizar datos de persona
   */
  updatePersona(personaId: string, personaData: Partial<Persona>): Observable<ApiResponse<Persona>> {
    return this.http.put<ApiResponse<Persona>>(`${this.apiUrl}/persona/${personaId}`, personaData);
  }

  /**
   * Obtener alumnos a cargo (para tutores)
   */
  getAlumnosACargo(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/tutor/alumnos`);
  }

  /**
   * Eliminar cuenta del usuario (soft delete)
   */
  deleteAccount(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/auth/account`);
  }
}
