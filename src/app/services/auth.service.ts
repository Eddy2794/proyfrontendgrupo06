import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, catchError, throwError, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { switchMap, map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { SecurityConfig } from '../config/security.config';
import { NotificationService } from './notification.service';

interface LoginResponse { 
  success?: boolean;
  token?: string; 
  user?: any; 
  message?: string;
  data?: {
    token?: string;
    user?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

interface UserProfile {
  _id: string;
  username: string;
  persona: any;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  
  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();
  
  // Cache para el estado de autenticación
  private _isAuthenticated = false;
  private _tokenValidationPromise: Promise<boolean> | null = null;

  constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService) {
    // No inicializar automáticamente para evitar dependencias circulares
    // La inicialización se hará de forma lazy cuando sea necesaria
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }

  /**
   * Inicializar autenticación verificando token existente (lazy loading)
   */
  private initializeAuth(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !this.tokenSubject.value) {
      this.tokenSubject.next(storedToken);
      // Verificar validez del token en segundo plano sin bloquear
      setTimeout(() => {
        this.validateTokenWithBackend().catch(() => {
          this.clearAuth();
        });
      }, 100);
    }
  }

  /**
   * Verificar token con el backend
   */
  private async validateTokenWithBackend(): Promise<boolean> {
    if (this._tokenValidationPromise) {
      return this._tokenValidationPromise;
    }

    this._tokenValidationPromise = new Promise((resolve) => {
      const token = this.tokenSubject.value;
      if (!token) {
        resolve(false);
        return;
      }

      console.log('Validando token con backend...');
      this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`).subscribe({
        next: (user) => {
          console.log('Usuario obtenido del backend:', user);
          this.userSubject.next(user);
          this._isAuthenticated = true;
          resolve(true);
        },
        error: (error) => {
          console.error('Error validando token con backend:', error);
          // No limpiar auth aquí si es un error 500, podría ser temporal
          if (error.status === 401 || error.status === 403) {
            console.log('Token inválido o expirado, limpiando auth');
            this.clearAuth();
          } else {
            console.log('Error temporal del servidor, manteniendo token');
          }
          resolve(false);
        }
      });
    });

    return this._tokenValidationPromise;
  }

  /**
   * Obtener clave de cifrado de forma más segura
   */
  private getEncryptionKey(): string {
    return SecurityConfig.getEncryptionKey();
  }

  /**
   * Login con validación completa y manejo de errores mejorado
   */
  login(credentials: { username: string; password: string; }): Observable<LoginResponse> {
    if (!credentials.username || !credentials.password) {
      return throwError(() => new Error('Username y password son requeridos'));
    }

    // Generar datos de seguridad
    const salt = this.generateSecureRandomString(SecurityConfig.TOKEN_CONFIG.saltBytes);
    const clientToken = this.generateSecureRandomString(SecurityConfig.TOKEN_CONFIG.clientTokenBytes);
    const timestamp = Date.now();
    
    // Cifrar contraseña
    const encryptedPassword = CryptoJS.AES.encrypt(
      credentials.password, 
      this.getEncryptionKey()
    ).toString();
    
    // Generar hash PBKDF2
    const passwordHashWordArray = CryptoJS.PBKDF2(credentials.password, salt, { 
      keySize: SecurityConfig.PBKDF2_CONFIG.keySize,
      iterations: SecurityConfig.PBKDF2_CONFIG.iterations,
      hasher: CryptoJS.algo.SHA256
    });
    const passwordHash = passwordHashWordArray.toString(CryptoJS.enc.Hex);
    
    const payload = {
      username: credentials.username.toLowerCase().trim(),
      passwordHash,
      salt,
      encryptedPassword,
      clientToken,
      timestamp
    };
    
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response: LoginResponse) => {
        // El token puede estar en response.token o response.data.token
        const token = response.token || (response as any).data?.token;
        const user = response.user || (response as any).data?.user;
        
        if (token) {
          this.setAuthData(token, user);
        } else {
          console.error('No se encontró token en la respuesta:', response);
        }
      }),
      catchError((error) => {
        console.error('Error de login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generar string aleatorio seguro
   */
  private generateSecureRandomString(bytes: number): string {
    return Array.from(window.crypto.getRandomValues(new Uint8Array(bytes)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Establecer datos de autenticación
   */
  private setAuthData(token: string, user?: any): void {
    if (!token) {
      console.error('Token no proporcionado a setAuthData');
      return;
    }
    
    // Establecer datos inmediatamente
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
    this._isAuthenticated = true;
    this._tokenValidationPromise = null;
    
    if (user) {
      this.userSubject.next(user);
    }
    
    // Navegar al dashboard después de login exitoso
    // Usar setTimeout para evitar problemas de timing
    setTimeout(() => {
      try {
        this.router.navigate(['/dashboard']).then(success => {
          if (!success) {
            window.location.href = '/#/dashboard';
          }
        }).catch(error => {
          window.location.href = '/#/dashboard';
        });
      } catch (error) {
        // Fallback en caso de error de navegación con hash routing
        window.location.href = '/#/dashboard';
      }
    }, 100);
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuth(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this._isAuthenticated = false;
    this._tokenValidationPromise = null;
  }

  register(data: any): Observable<{message: string}> {
    const url = `${environment.apiUrl}/auth/register`;
    return this.http.post<{message: string}>(url, data).pipe(
      tap(() => this.router.navigate(['/login']))
    );
  }

  /**
   * Logout seguro con invalidación en backend
   */
  logout(): void {
    const url = `${environment.apiUrl}/auth/logout`;
    // Usar un try-catch para evitar errores en caso de dependencias circulares
    try {
      this.http.post(url, {}).subscribe({
        next: () => {
          console.log('Logout backend exitoso');
          this.notificationService.showSuccess('Sesión cerrada', 'Has cerrado sesión exitosamente');
        },
        error: (error) => {
          console.warn('Error en logout backend:', error);
          this.notificationService.showWarning('Sesión cerrada', 'Sesión cerrada localmente');
        }
      });
    } catch (error) {
      console.warn('Error ejecutando logout backend:', error);
      this.notificationService.showWarning('Sesión cerrada', 'Sesión cerrada localmente');
    }
    
    this.clearAuth();
    
    // Navegación segura con fallback
    try {
      this.router.navigate(['/login']);
    } catch (error) {
      console.warn('Error navegando, usando window.location');
      window.location.href = '/login';
    }
  }

  /**
   * Verificar si el usuario está autenticado (con inicialización lazy)
   */
  async isAuthenticated(): Promise<boolean> {
    // Inicializar si no se ha hecho antes
    if (!this.tokenSubject.value && localStorage.getItem('token')) {
      this.initializeAuth();
    }
    
    if (this._isAuthenticated && this.tokenSubject.value) {
      return true;
    }
    
    if (this.tokenSubject.value) {
      return await this.validateTokenWithBackend();
    }
    
    return false;
  }

  /**
   * Obtener token actual
   */
  get token(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Obtener usuario actual
   */
  get currentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  /**
   * Verificación síncrona básica para AuthGuard
   */
  get hasValidToken(): boolean {
    return !!this.tokenSubject.value;
  }

  /**
   * Establecer token OAuth desde URL parameters
   */
  public setOAuthToken(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!token) {
        console.error('Token OAuth no proporcionado');
        resolve(false);
        return;
      }

      console.log('Procesando token OAuth:', token ? 'PRESENTE' : 'AUSENTE');
      
      // Establecer token inmediatamente
      localStorage.setItem('token', token);
      this.tokenSubject.next(token);
      this._isAuthenticated = true;
      this._tokenValidationPromise = null;

      // Intentar validar el token con el backend
      this.validateTokenWithBackend().then(isValid => {
        if (isValid) {
          console.log('Token OAuth validado exitosamente');
        } else {
          console.log('No se pudo validar el perfil, pero continuando con el token');
        }
        
        // Navegar al dashboard independientemente de la validación del perfil
        // El token viene del backend OAuth, por lo que es válido
        setTimeout(() => {
          try {
            this.router.navigate(['/dashboard']).then(success => {
              if (!success) {
                window.location.href = '/#/dashboard';
              }
              resolve(true);
            }).catch(() => {
              window.location.href = '/#/dashboard';
              resolve(true);
            });
          } catch (error) {
            window.location.href = '/#/dashboard';
            resolve(true);
          }
        }, 100);
      }).catch(error => {
        console.error('Error validando token OAuth:', error);
        
        // Para OAuth, el token viene del backend autorizado, así que navegamos igual
        // El error del perfil no invalida el token OAuth
        console.log('Continuando con token OAuth a pesar del error del perfil');
        setTimeout(() => {
          try {
            this.router.navigate(['/dashboard']).then(success => {
              if (!success) {
                window.location.href = '/#/dashboard';
              }
              resolve(true);
            }).catch(() => {
              window.location.href = '/#/dashboard';
              resolve(true);
            });
          } catch (error) {
            window.location.href = '/#/dashboard';
            resolve(true);
          }
        }, 100);
      });
    });
  }
}
