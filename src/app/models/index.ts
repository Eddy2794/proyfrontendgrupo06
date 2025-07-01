// Exportar modelos de Persona
export * from './persona.model';

// Exportar modelos de Usuario
export * from './user.model';

// Exportar modelos de Autenticación
export * from './auth.model';

// Exportar modelos de Categoría
export * from './categoria';

// Exportar modelos de Categoría Escuela
export * from './categoria-escuela.model';

// Exportar modelos de Pago
export * from './pago.model';

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

// Re-exportar clases modelo
export { PersonaModel, TIPOS_DOCUMENTO, GENEROS, ESTADOS_PERSONA } from './persona.model';
export { UserModel } from './user.model';
export { RegisterModel, LoginModel, AuthStateModel } from './auth.model';
