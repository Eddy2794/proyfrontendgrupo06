import { Routes } from '@angular/router';
import { CuotaComponent } from './cuota/cuota.component';
import {hasRoleGuard} from '../../guards/has-role.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./cuota/cuota.component').then(m => m.CuotaComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Gestión de Cuotas',
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    }
  },
  {
    path: 'cuota-form/:id',
    loadComponent: () => import('./cuota-form/cuota-form.component').then(m => m.CuotaFormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Formulario de Cuota',
      roles: ['ADMIN', 'MODERATOR']
    }
  }
]; 