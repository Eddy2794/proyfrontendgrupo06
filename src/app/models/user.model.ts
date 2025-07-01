import { Persona } from './persona.model';

// Tipos constantes basados en el backend
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'TUTOR' | 'MODERATOR';
export type UserState = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'PENDIENTE_VERIFICACION';

// Interfaz para configuraciones del usuario (adaptada al backend)
export interface UserSettings {
  notificacionesEmail?: boolean;
  notificacionesPush?: boolean;
  perfilPublico?: boolean;
  temaOscuro?: boolean;
}

// Interfaz para historial de autenticación
export interface AuthHistory {
  fechaLogin: Date | string;
  exitoso: boolean;
  metodo: 'credentials' | 'google-oauth' | 'google-oauth-register' | 'dev-credentials';
  userAgent?: string;
  ip?: string;
}

// Interfaz principal para Usuario (adaptada al backend)
export interface User {
  _id?: string;
  persona: string | Persona; // ID de referencia a persona o objeto Persona completo
  username: string;
  password?: string; // Solo para formularios, no se devuelve del backend
  rol?: UserRole;
  estado?: UserState;
  configuraciones?: UserSettings;
  ultimoLogin?: Date | string;
  intentosLogin?: number;
  bloqueadoHasta?: Date | string;
  tokenVerificacion?: string;
  emailVerificado?: boolean;
  imagenPerfil?: string; // Imagen en base64
  tokenRecuperacion?: string;
  tokenRecuperacionExpira?: Date | string;
  historialAuth?: AuthHistory[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string; // Para soft delete
  deletedBy?: string; // Usuario que realizó la eliminación
  isDeleted?: boolean; // Flag de soft delete
}

// Clase para el modelo Usuario con validaciones y métodos auxiliares
export class UserModel implements User {
  _id?: string;
  persona: string | Persona;
  username: string;
  password?: string;
  rol?: UserRole;
  estado?: UserState;
  ultimoLogin?: Date | string;
  intentosLogin?: number;
  bloqueadoHasta?: Date | string;
  emailVerificado?: boolean;
  imagenPerfil?: string;
  configuraciones?: UserSettings;
  historialAuth?: AuthHistory[];
  createdAt?: Date | string;
  updatedAt?: Date | string;

  constructor(data: Partial<User> = {}) {
    this._id = data._id;
    this.persona = data.persona || '';
    this.username = data.username || '';
    this.password = data.password;
    this.rol = data.rol || 'USER';
    this.estado = data.estado || 'ACTIVO';
    this.ultimoLogin = data.ultimoLogin;
    this.intentosLogin = data.intentosLogin || 0;
    this.bloqueadoHasta = data.bloqueadoHasta;
    this.emailVerificado = data.emailVerificado || false;
    this.imagenPerfil = data.imagenPerfil;
    this.configuraciones = data.configuraciones || {
      notificacionesEmail: true,
      notificacionesPush: false,
      perfilPublico: false,
      temaOscuro: false
    };
    this.historialAuth = data.historialAuth || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Getter para verificar si el usuario está activo
  get estaActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  // Getter para verificar si el usuario es administrador
  get esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  // Getter para verificar si el usuario es moderador
  get esModerador(): boolean {
    return this.rol === 'MODERATOR' || this.rol === 'ADMIN';
  }

  // Getter para verificar si la cuenta está bloqueada
  get cuentaBloqueada(): boolean {
    if (!this.bloqueadoHasta) return false;
    return new Date(this.bloqueadoHasta) > new Date();
  }

  // Getter para obtener los datos de persona si está disponible
  get datosPersona(): Persona | null {
    if (typeof this.persona === 'object' && this.persona !== null) {
      return this.persona as Persona;
    }
    return null;
  }

  // Método para obtener el nombre completo del usuario
  get nombreCompleto(): string {
    const persona = this.datosPersona;
    if (persona) {
      return `${persona.nombres} ${persona.apellidos}`.trim();
    }
    return this.username;
  }

  // Método para verificar si tiene permisos específicos
  tienePermiso(permiso: string): boolean {
    switch (permiso) {
      case 'admin':
        return this.esAdmin;
      case 'moderator':
        return this.esModerador;
      case 'user':
        return this.estaActivo;
      default:
        return false;
    }
  }

  // Método para obtener la configuración del tema
  get tema(): 'light' | 'dark' | 'auto' {
    return this.configuraciones?.temaOscuro ? 'dark' : 'light';
  }

  // Método para convertir a objeto plano para envío al backend
  toJSON(): any {
    const result: any = {
      _id: this._id,
      persona: typeof this.persona === 'string' ? this.persona : this.persona._id,
      username: this.username,
      rol: this.rol,
      estado: this.estado,
      ultimoLogin: this.ultimoLogin,
      intentosLogin: this.intentosLogin,
      bloqueadoHasta: this.bloqueadoHasta,
      configuraciones: this.configuraciones,
      historialAuth: this.historialAuth,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    // Solo incluir password si existe (para formularios de registro/cambio de contraseña)
    if (this.password) {
      result.password = this.password;
    }

    return result;
  }

  // Método estático para crear desde datos del backend
  static fromJSON(data: any): UserModel {
    return new UserModel(data);
  }
}

// Constantes para usar en formularios y validaciones
export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'USER', label: 'Usuario' },
  { value: 'MODERATOR', label: 'Moderador' },
  { value: 'ADMIN', label: 'Administrador' }
];

export const USER_STATES: { value: UserState; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'PENDIENTE_VERIFICACION', label: 'Pendiente de Verificación' }
];
