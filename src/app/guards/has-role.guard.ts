import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const roles = route.data?.['roles'] as string[];
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.currentUser?.rol;
  console.log('Rol actual:', userRole, 'Roles permitidos:', roles);
  if (!userRole) {
    localStorage.clear();
    sessionStorage.clear();
    alert('Sesión inválida. Por favor, vuelve a iniciar sesión.');
    router.navigate(['/login']);
    return false;
  }
  if (roles && userRole && roles.includes(userRole)) {
    return true;
  } else {
    alert('No tienes permisos para acceder a esta página.');
    router.navigate(['/dashboard']); // Cambia '/login' por la ruta que prefieras
    return false;
  }
};
