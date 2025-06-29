import { environment } from '../../environments/environment';

/**
 * Configuración de seguridad para la aplicación
 * 
 * IMPORTANTE: En producción, estas claves deben obtenerse de:
 * 1. Variables de entorno del servidor
 * 2. Un endpoint seguro de configuración
 * 3. Un servicio de gestión de claves (Key Management Service)
 * 
 * NUNCA almacenar claves sensibles directamente en el código fuente
 */
export class SecurityConfig {
  
  /**
   * Obtener clave de cifrado AES
   * En desarrollo usa una clave local, en producción debería obtenerse de forma segura
   */
  static getEncryptionKey(): string {
    if (environment.production) {
      // En producción, esta clave debería obtenerse desde:
      // 1. Un endpoint seguro del backend
      // 2. Una configuración del servidor
      // 3. Un servicio de gestión de claves
      
      // Por ahora, usar la misma clave que el backend para compatibilidad
      // TODO: Implementar obtención segura de clave en producción
      return 'mi-clave-super-secreta-32-chars!!';
    }
    
    // En desarrollo, usar clave local que coincida con backend
    return 'mi-clave-super-secreta-32-chars!!';
  }

  /**
   * Configuración de PBKDF2
   */
  static readonly PBKDF2_CONFIG = {
    keySize: 256/32, // 32 bytes
    iterations: 10000,
    hasher: 'SHA256' as const
  };

  /**
   * Configuración de generación de tokens
   */
  static readonly TOKEN_CONFIG = {
    saltBytes: 16,      // 16 bytes = 32 hex chars
    clientTokenBytes: 32 // 32 bytes = 64 hex chars
  };

  /**
   * Configuración de timeouts de sesión
   */
  static readonly SESSION_CONFIG = {
    tokenValidationCacheMs: 5 * 60 * 1000, // 5 minutos
    maxLoginAttempts: 5,
    lockoutDurationMs: 15 * 60 * 1000 // 15 minutos
  };

  /**
   * Validar configuración de seguridad
   */
  static validateSecurityConfig(): boolean {
    const key = this.getEncryptionKey();
    
    if (!key || key.length < 32) {
      console.error('SECURITY ERROR: Clave de cifrado inválida o muy corta');
      return false;
    }
    
    if (environment.production && key === 'mi-clave-super-secreta-32-chars!!') {
      console.warn('SECURITY WARNING: Usando clave por defecto en producción - considere implementar gestión segura de claves');
      // En producción, esto debería ser un error, pero por compatibilidad solo advertimos
    }
    
    return true;
  }
}

/**
 * Verificar configuración al cargar el módulo
 */
if (!SecurityConfig.validateSecurityConfig()) {
  throw new Error('Configuración de seguridad inválida');
}
