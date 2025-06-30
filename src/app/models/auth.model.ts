import { Persona, Direccion } from './persona.model';
import { User } from './user.model';

// Interfaz para el request de registro
export interface RegisterRequest {
  // Datos de persona
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string | Date;
  genero: string;
  telefono?: string;
  email: string;
  direccion?: Direccion;
  
  // Datos de usuario
  username: string;
  password: string;
}

// Interfaz para el request de login (según el backend con encriptación)
export interface LoginRequest {
  username: string;
  passwordHash: string;
  salt: string;
  encryptedPassword: string;
  clientToken?: string;
  timestamp?: number;
}

// Interfaz para el request de login simple (para el frontend)
export interface SimpleLoginRequest {
  username: string;
  password: string;
}

// Interfaz para la respuesta de autenticación
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
  persona?: Persona;
  expiresIn?: number;
  data?: {
    token?: string;
    user?: User;
    persona?: Persona;
    [key: string]: any;
  };
}

// Interfaz para el request de cambio de contraseña
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Interfaz para tokens de autenticación
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

// Interfaz para el estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  persona: Persona | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

// Clase para manejar el registro con validaciones
export class RegisterModel implements RegisterRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string | Date;
  genero: string;
  telefono?: string;
  email: string;
  direccion?: Direccion;
  username: string;
  password: string;

  constructor(data: Partial<RegisterRequest> = {}) {
    this.nombres = data.nombres || '';
    this.apellidos = data.apellidos || '';
    this.tipoDocumento = data.tipoDocumento || 'DNI';
    this.numeroDocumento = data.numeroDocumento || '';
    this.fechaNacimiento = data.fechaNacimiento || '';
    this.genero = data.genero || 'MASCULINO';
    this.telefono = data.telefono;
    this.email = data.email || '';
    this.direccion = data.direccion;
    this.username = data.username || '';
    this.password = data.password || '';
  }

  // Validaciones del formulario
  get isValid(): boolean {
    return !!(
      this.nombres.trim() &&
      this.apellidos.trim() &&
      this.tipoDocumento &&
      this.numeroDocumento.trim() &&
      this.fechaNacimiento &&
      this.genero &&
      this.email.trim() &&
      this.username.trim() &&
      this.password
    );
  }

  // Validación de email
  get isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  // Validación de contraseña (mínimo 6 caracteres)
  get isPasswordValid(): boolean {
    return this.password.length >= 6;
  }

  // Validación de username (alfanumérico, 3-30 caracteres)
  get isUsernameValid(): boolean {
    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    return usernameRegex.test(this.username);
  }

  // Método para convertir a objeto para envío al backend
  toJSON(): RegisterRequest {
    return {
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento.trim(),
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
      telefono: this.telefono?.trim(),
      email: this.email.trim().toLowerCase(),
      direccion: this.direccion,
      username: this.username.trim().toLowerCase(),
      password: this.password
    };
  }
}

// Clase para manejar el login
export class LoginModel implements SimpleLoginRequest {
  username: string;
  password: string;

  constructor(data: Partial<SimpleLoginRequest> = {}) {
    this.username = data.username || '';
    this.password = data.password || '';
  }

  // Validaciones del formulario
  get isValid(): boolean {
    return !!(this.username.trim() && this.password);
  }

  // Método para convertir a objeto para envío al backend
  toJSON(): SimpleLoginRequest {
    return {
      username: this.username.trim().toLowerCase(),
      password: this.password
    };
  }
}

// Clase para el estado de autenticación
export class AuthStateModel implements AuthState {
  isAuthenticated: boolean;
  user: User | null;
  persona: Persona | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;

  constructor(data: Partial<AuthState> = {}) {
    this.isAuthenticated = data.isAuthenticated || false;
    this.user = data.user || null;
    this.persona = data.persona || null;
    this.tokens = data.tokens || null;
    this.loading = data.loading || false;
    this.error = data.error || null;
  }

  // Método para limpiar el estado
  clear(): void {
    this.isAuthenticated = false;
    this.user = null;
    this.persona = null;
    this.tokens = null;
    this.loading = false;
    this.error = null;
  }

  // Método para establecer el estado autenticado
  setAuthenticated(user: User, persona: Persona, tokens: AuthTokens): void {
    this.isAuthenticated = true;
    this.user = user;
    this.persona = persona;
    this.tokens = tokens;
    this.loading = false;
    this.error = null;
  }

  // Método para establecer error
  setError(error: string): void {
    this.error = error;
    this.loading = false;
  }

  // Método para establecer loading
  setLoading(loading: boolean): void {
    this.loading = loading;
    if (loading) {
      this.error = null;
    }
  }
}

// Tipos de errores de autenticación
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

// Interfaz para errores de autenticación
export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
}
