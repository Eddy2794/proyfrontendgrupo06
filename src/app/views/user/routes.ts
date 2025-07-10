import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Lista de Usuarios',
      roles: ['ADMIN', 'MODERATOR']
    }
  },
  {
    path: 'form',
    loadComponent: () => import('./form/form.component').then(m => m.FormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Crear Usuario',
      roles: ['ADMIN']
    }
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./form/form.component').then(m => m.FormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Editar Usuario',
      roles: ['ADMIN']
    }
  }
];
