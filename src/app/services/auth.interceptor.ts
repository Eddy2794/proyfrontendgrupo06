import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.token;
    
    // Verificar si el token está expirado antes de agregarlo
    if (token && this.isTokenExpired(token)) {
      console.warn('🔒 Token expirado detectado en interceptor, limpiando sesión');
      this.auth.logout();
      return throwError(() => new HttpErrorResponse({ 
        status: 401, 
        statusText: 'Token Expired',
        error: { message: 'Token expirado' }
      }));
    }
    
    // Agregar token de autorización si existe y no está expirado
    const authReq = token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('🔒 Token inválido o expirado, limpiando sesión');
          this.auth.logout();
          return throwError(() => error);
        }
        
        if (error.status === 403) {
          console.warn('🚫 Acceso denegado');
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Verificar si un token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true; // Token malformado
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return currentTime > payload.exp;
    } catch (error) {
      console.error('Error verificando expiración del token en interceptor:', error);
      return true; // En caso de error, considerar expirado
    }
  }
}
