import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  
  constructor(private authService: AuthService) {
    // Inicializar inmediatamente al construir el servicio
    this.initialize();
  }

  /**
   * Inicializar el servicio con todos los listeners necesarios
   */
  private initialize(): void {
    // Escuchar eventos de beforeunload para persistir datos
    window.addEventListener('beforeunload', () => {
      this.persistUserState();
    });
    
    // Escuchar eventos de visibilitychange para restaurar datos
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.restoreUserStateIfNeeded();
      }
    });
    
    // Escuchar eventos de focus para restaurar datos
    window.addEventListener('focus', () => {
      this.restoreUserStateIfNeeded();
    });
    
    // Realizar una verificación inicial después de un pequeño delay
    setTimeout(() => {
      this.restoreUserStateIfNeeded();
    }, 100);
    
    console.log('UserStateService inicializado con listeners de persistencia');
  }

  /**
   * Persistir estado del usuario antes de recargas
   */
  private persistUserState(): void {
    const currentUser = this.authService.currentUser;
    const token = this.authService.token;
    
    if (currentUser && token) {
      localStorage.setItem('userStatePersisted', 'true');
      localStorage.setItem('userStateTimestamp', Date.now().toString());
      console.log('Estado del usuario persistido antes de recarga');
    }
  }

  /**
   * Restaurar estado del usuario si es necesario
   */
  private restoreUserStateIfNeeded(): void {
    const wasPersisted = localStorage.getItem('userStatePersisted');
    const timestamp = localStorage.getItem('userStateTimestamp');
    const hasToken = this.authService.token || localStorage.getItem('token');
    const hasUser = this.authService.currentUser;
    
    // Si hay token pero no hay usuario, intentar restaurar
    if (hasToken && !hasUser) {
      console.log('Detectado token sin usuario, iniciando restauración...');
      this.authService.initializeAuthIfNeeded();
      
      // Si aún no hay usuario después de la inicialización, refrescar desde backend
      setTimeout(() => {
        if (this.authService.token && !this.authService.currentUser) {
          console.log('Refrescando usuario desde backend...');
          this.authService.refreshUserProfile().subscribe({
            next: (user) => {
              console.log('Usuario restaurado exitosamente después de recarga');
            },
            error: (error) => {
              console.error('Error restaurando usuario después de recarga:', error);
            }
          });
        }
      }, 200);
    }
    
    // Limpiar flags de persistencia si fueron usados recientemente
    if (wasPersisted && timestamp) {
      const timeDiff = Date.now() - parseInt(timestamp);
      // Solo limpiar si fue hace menos de 10 minutos
      if (timeDiff < 10 * 60 * 1000) {
        localStorage.removeItem('userStatePersisted');
        localStorage.removeItem('userStateTimestamp');
      }
    }
  }

  /**
   * Forzar restauración de estado del usuario
   */
  public forceRestoreUserState(): void {
    console.log('Forzando restauración de estado del usuario...');
    this.authService.initializeAuthIfNeeded();
    
    if (this.authService.token && !this.authService.currentUser) {
      this.authService.refreshUserProfile().subscribe({
        next: (user) => {
          console.log('Estado del usuario restaurado forzadamente');
        },
        error: (error) => {
          console.error('Error en restauración forzada:', error);
        }
      });
    }
  }

  /**
   * Verificar y restaurar usuario periódicamente
   */
  public checkAndRestoreUser(): void {
    const hasToken = this.authService.token || localStorage.getItem('token');
    const hasUser = this.authService.currentUser;
    
    if (hasToken && !hasUser) {
      console.log('Verificación periódica: restaurando usuario...');
      this.forceRestoreUserState();
    }
  }
}
