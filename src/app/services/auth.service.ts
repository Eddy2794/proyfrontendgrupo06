import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, catchError, throwError, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { switchMap, map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { SecurityConfig } from '../config/security.config';
import { NotificationService } from './notification.service';
import { 
  AuthResponse, 
  RegisterRequest, 
  SimpleLoginRequest, 
  AuthState, 
  User, 
  Persona, 
  AuthTokens,
  UserModel,
  PersonaModel,
  AuthStateModel,
  UserRole
} from '../models';

interface UserProfile extends User {
  _id: string;
  username: string;
  persona: Persona;
  rol: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>(new AuthStateModel());
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);
  private personaSubject = new BehaviorSubject<Persona | null>(null);
  
  public authState$ = this.authStateSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();
  public persona$ = this.personaSubject.asObservable();
  
  // Cache para el estado de autenticación
  private _isAuthenticated = false;
  private _tokenValidationPromise: Promise<boolean> | null = null;

  constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService) {
    // Inicializar automáticamente para restaurar estado desde localStorage
    this.initializeAuth();
  }

  /**
   * Inicializar autenticación verificando token existente (lazy loading)
   */
  private initializeAuth(): void {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    const storedPersona = localStorage.getItem('currentPersona');
    
    if (storedToken && !this.tokenSubject.value) {
      this.tokenSubject.next(storedToken);
      
      // Restaurar datos del usuario desde localStorage si están disponibles
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.userSubject.next(user);
          console.log('Usuario restaurado desde localStorage:', user);
        } catch (error) {
          console.error('Error parseando usuario desde localStorage:', error);
        }
      }
      
      if (storedPersona) {
        try {
          const persona = JSON.parse(storedPersona);
          this.personaSubject.next(persona);
          console.log('Persona restaurada desde localStorage:', persona);
        } catch (error) {
          console.error('Error parseando persona desde localStorage:', error);
        }
      }
      
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
  login(credentials: SimpleLoginRequest): Observable<AuthResponse> {
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
    return this.http.post<AuthResponse>(url, payload).pipe(
      tap((response: AuthResponse) => {
        // El token puede estar directamente en response.token o en response.data.token
        const token = response.token || response.data?.token;
        const user = response.user || response.data?.user;
        
        if (token) {
          this.setAuthData(token, user);
          if (response.success) {
            this.notificationService.showSuccess('Login exitoso', response.message || 'Bienvenido');
          }
        } else {
          console.error('No se encontró token en la respuesta:', response);
          throw new Error('Token no recibido del servidor');
        }
      }),
      catchError((error) => {
        console.error('Error de login:', error);
        const errorMessage = error.error?.message || 'Error de autenticación';
        this.notificationService.showError('Error de login', errorMessage);
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
  private setAuthData(token: string, user?: User): void {
    if (!token) {
      console.error('Token no proporcionado a setAuthData');
      return;
    }
    
    // Establecer datos inmediatamente
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
    this._isAuthenticated = true;
    this._tokenValidationPromise = null;
    
    // Persistir datos del usuario en localStorage para evitar pérdida en refreshes
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.userSubject.next(user);
      
      // Si el usuario tiene una persona asociada, también la actualizamos
      if (user.persona && typeof user.persona !== 'string') {
        localStorage.setItem('currentPersona', JSON.stringify(user.persona));
        this.personaSubject.next(user.persona as Persona);
      }
    }
    
    // Actualizar estado de autenticación
    const authState = new AuthStateModel();
    authState.isAuthenticated = true;
    authState.tokens = { 
      accessToken: token, 
      refreshToken: undefined, 
      expiresIn: 0, 
      tokenType: 'Bearer' 
    };
    
    if (user) {
      authState.user = user;
      if (user.persona && typeof user.persona !== 'string') {
        authState.persona = user.persona as Persona;
      }
    }
    
    this.authStateSubject.next(authState);
    
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentPersona');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.personaSubject.next(null);
    this._isAuthenticated = false;
    this._tokenValidationPromise = null;
    
    // Limpiar estado de autenticación
    const authState = new AuthStateModel();
    authState.clear();
    this.authStateSubject.next(authState);
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/register`;
    return this.http.post<AuthResponse>(url, registerRequest).pipe(
      tap((response) => {
        if (response.success) {
          this.notificationService.showSuccess('Registro exitoso', response.message || 'Usuario registrado correctamente');
          this.router.navigate(['/login']);
        }
        
        // Si el registro incluye un token (auto-login), manejarlo
        const token = response.token || response.data?.token;
        const user = response.user || response.data?.user;
        if (token && user) {
          this.setAuthData(token, user);
        }
      }),
      catchError((error) => {
        console.error('Error de registro:', error);
        const errorMessage = error.error?.message || 'Error al registrar usuario';
        this.notificationService.showError('Error de registro', errorMessage);
        return throwError(() => error);
      })
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
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Obtener persona actual
   */
  get currentPersona(): Persona | null {
    return this.personaSubject.value;
  }

  /**
   * Obtener estado de autenticación actual
   */
  get currentAuthState(): AuthState {
    return this.authStateSubject.value;
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
          this.notificationService.showSuccess('Autenticación exitosa', 'Bienvenido, has iniciado sesión con Google');
        } else {
          console.log('No se pudo validar el perfil, pero continuando con el token');
          this.notificationService.showWarning('Advertencia', 'Sesión iniciada pero no se pudo cargar el perfil completo');
        }
        
        // Navegar al dashboard independientemente de la validación del perfil
        // El token viene del backend OAuth, por lo que es válido
        setTimeout(() => {
          try {
            // Limpiar los parámetros de la URL antes de navegar
            const currentUrl = window.location.href;
            const baseUrl = currentUrl.split('?')[0].split('#')[0];
            
            this.router.navigate(['/dashboard']).then(success => {
              if (success) {
                // Actualizar la URL para eliminar los parámetros del token
                window.history.replaceState({}, '', `${baseUrl}#/dashboard`);
              } else {
                window.location.href = '/#/dashboard';
              }
              resolve(true);
            }).catch(() => {
              window.location.href = '/#/dashboard';
              resolve(true);
            });
          } catch (error) {
            console.error('Error navigating after OAuth:', error);
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

  /**
   * Obtener usuario actual como Observable (útil para componentes)
   */
  getCurrentUser(): Observable<User> {
    // Primero intentar usar el usuario en cache
    const currentUser = this.userSubject.value;
    if (currentUser) {
      return new Observable(observer => {
        observer.next(currentUser);
        observer.complete();
      });
    }

    // Si no hay usuario en cache, intentar validar el token y obtener el perfil
    return new Observable(observer => {
      this.validateTokenWithBackend()
        .then(isValid => {
          if (isValid && this.userSubject.value) {
            observer.next(this.userSubject.value);
            observer.complete();
          } else {
            observer.error(new Error('Usuario no autenticado'));
          }
        })
        .catch(error => {
          observer.error(new Error('Usuario no autenticado'));
        });
    });
  }

  /**
   * Actualizar el usuario actual en el estado de autenticación
   */
  updateCurrentUser(user: User): void {
    console.log('Actualizando usuario actual en auth service:', user);
    
    // Persistir en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user);
    
    // También actualizar persona si está incluida
    if (user.persona && typeof user.persona === 'object') {
      localStorage.setItem('currentPersona', JSON.stringify(user.persona));
      this.personaSubject.next(user.persona as Persona);
    }
    
    // Actualizar el estado de autenticación
    const currentAuthState = this.authStateSubject.value;
    if (currentAuthState) {
      currentAuthState.user = user;
      if (user.persona && typeof user.persona === 'object') {
        currentAuthState.persona = user.persona as Persona;
      }
      this.authStateSubject.next(currentAuthState);
    }
  }

  /**
   * Refrescar datos del usuario desde el backend
   */
  refreshUserProfile(): Observable<User> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`).pipe(
      tap((user) => {
        console.log('Usuario refrescado desde backend:', user);
        this.updateCurrentUser(user);
      })
    );
  }

  /**
   * Forzar inicialización de autenticación (método público)
   */
  public initializeAuthIfNeeded(): void {
    if (!this.tokenSubject.value && localStorage.getItem('token')) {
      console.log('Forzando inicialización de autenticación...');
      this.initializeAuth();
    }
  }

  /**
   * Obtener rol actual del usuario
   */
  get currentRole(): string | undefined {
    return this.currentUser?.rol;
  }
}
