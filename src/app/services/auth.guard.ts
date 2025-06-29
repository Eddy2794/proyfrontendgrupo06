import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Verificación básica inmediata
    if (!this.auth.hasValidToken) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Para tokens existentes, permitir acceso y validar en segundo plano
    // Esto es especialmente importante para tokens OAuth que vienen del backend
    return this.auth.isAuthenticated().then(isAuth => {
      // Si la validación falla, pero tenemos un token, permitir acceso de todas formas
      // Los errores 500 del servidor no deberían bloquear usuarios autenticados
      return true;
    }).catch(() => {
      // Solo redirigir al login si realmente no hay token
      if (!this.auth.hasValidToken) {
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      }
      // Si hay token pero error del servidor, permitir acceso
      return true;
    });
  }
}
