// Exportar modelos de Persona
export * from './persona.model';

// Exportar modelos de Usuario
export * from './user.model';

// Exportar modelos de Autenticación
export * from './auth.model';

// Exportar modelos de Categoría
export * from './categoria';

// Nota: categoria-escuela.model eliminado en Fase 2 de migración

// Exportar modelos de Pago
export * from './pago.model';

// Exportar modelos de Alumno
export * from './alumno.model';

// Exportar modelos de AlumnoCategoria
export * from './alumno-categoria.model';

// Exportar modelos de Cuota
export * from './cuota.model';

// Re-exportar tipos comunes
export type { TipoDocumento, Genero, EstadoPersona, Direccion } from './persona.model';
export type { UserRole, UserState, UserSettings, AuthHistory } from './user.model';
export type { 
  RegisterRequest, 
  LoginRequest, 
  SimpleLoginRequest, 
  AuthResponse, 
  ChangePasswordRequest, 
  AuthTokens, 
  AuthState,
  AuthError,
  AuthErrorType 
} from './auth.model';

export type { EstadoAlumno } from './alumno.model';
export type { EstadoAlumnoCategoria } from './alumno-categoria.model';
export type { EstadoCuota } from './cuota.model';

// Re-exportar clases modelo
export { PersonaModel, TIPOS_DOCUMENTO, GENEROS, ESTADOS_PERSONA } from './persona.model';
export { UserModel } from './user.model';
export { RegisterModel, LoginModel, AuthStateModel } from './auth.model';
export { AlumnoModel, ESTADOS_ALUMNO } from './alumno.model';
export { AlumnoCategoriaModel, ESTADOS_ALUMNO_CATEGORIA } from './alumno-categoria.model';
export { CuotaModel, ESTADOS_CUOTA, MESES } from './cuota.model';
