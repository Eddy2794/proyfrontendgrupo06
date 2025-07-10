import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profesor.component').then(m => m.ProfesorComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Nuevo Profesor',
      roles: ['ADMIN', 'MODERATOR']
    }
  },
  {
    path: 'lista',
    loadComponent: () => import('../profesor-list/profesor-list.component').then(m => m.ProfesorListComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Lista de Profesores',
      roles: ['ADMIN', 'MODERATOR' ,'TUTOR']
    }
  }
]; 