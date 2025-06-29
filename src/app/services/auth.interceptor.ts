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
    
    // Agregar token de autorización si existe
    const authReq = token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación sin usar Router para evitar dependencia circular
        if (error.status === 401) {
          console.warn('Token inválido o expirado, limpiando sesión');
          // Solo limpiar el estado sin redirigir para evitar dependencia circular
          this.auth.logout();
          return throwError(() => error);
        }
        
        // Manejar otros errores
        if (error.status === 403) {
          console.warn('Acceso denegado');
        }
        
        return throwError(() => error);
      })
    );
  }
}
