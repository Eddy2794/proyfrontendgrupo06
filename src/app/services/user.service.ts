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

  // ==================== MÉTODOS ADMINISTRATIVOS ====================

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  getAllUsers(page: number = 1, limit: number = 10, search?: string, estado?: string, rol?: string): Observable<ApiResponse<{users: User[], total: number, totalPages: number, currentPage: number}>> {
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    if (estado) {
      params += `&estado=${estado}`;
    }
    if (rol) {
      params += `&rol=${rol}`;
    }
    return this.http.get<ApiResponse<{users: User[], total: number, totalPages: number, currentPage: number}>>(`${this.apiUrl}/users${params}`);
  }

  /**
   * Obtener usuario por ID (solo para administradores)
   */
  getUserById(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Obtener perfil completo de usuario por ID (solo para administradores)
   */
  getUserProfile(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${userId}/profile`);
  }

  /**
   * Crear nuevo usuario (solo para administradores)
   */
  createUser(userData: { persona: string; username: string; password: string; rol?: string }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/users`, userData);
  }

  /**
   * Actualizar usuario (solo para administradores)
   */
  updateUser(userId: string, userData: { username?: string; rol?: string; estado?: string }): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${userId}`, userData);
  }

  /**
   * Eliminar usuario (solo para administradores) - Soft Delete
   */
  deleteUser(userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Restaurar usuario eliminado (solo para administradores)
   */
  restoreUser(userId: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/users/${userId}/restore`, {});
  }

  /**
   * Activar usuario (solo para administradores)
   */
  activateUser(userId: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  /**
   * Obtener usuarios por rol (solo para administradores)
   */
  getUsersByRole(role: string, page: number = 1, limit: number = 10): Observable<ApiResponse<{users: User[], total: number}>> {
    return this.http.get<ApiResponse<{users: User[], total: number}>>(`${this.apiUrl}/users/role/${role}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtener estadísticas de usuarios (solo para administradores)
   */
  getUserStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/stats`);
  }

  /**
   * Obtener usuarios eliminados (solo para administradores)
   */
  getDeletedUsers(page: number = 1, limit: number = 10): Observable<ApiResponse<{users: User[], total: number}>> {
    return this.http.get<ApiResponse<{users: User[], total: number}>>(`${this.apiUrl}/users/deleted/list?page=${page}&limit=${limit}`);
  }

  /**
   * Obtener todos los usuarios incluyendo eliminados (solo para administradores)
   */
  getAllUsersIncludingDeleted(page: number = 1, limit: number = 10, includeDeleted: boolean = false): Observable<ApiResponse<{users: User[], total: number}>> {
    return this.http.get<ApiResponse<{users: User[], total: number}>>(`${this.apiUrl}/users/all/including-deleted?page=${page}&limit=${limit}&includeDeleted=${includeDeleted}`);
  }

  /**
   * Obtener estadísticas de auditoría (solo para administradores)
   */
  getAuditStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/audit-stats`);
  }
}
