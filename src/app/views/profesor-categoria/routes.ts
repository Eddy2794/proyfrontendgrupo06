import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profesor-categoria-form/profesor-categoria-form.component').then(m => m.ProfesorCategoriaFormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Asignar Categoría',
      roles: ['ADMIN', 'MODERATOR']
    }
  },
  {
    path: 'lista',
    loadComponent: () => import('./profesor-categoria-list/profesor-categoria-list.component').then(m => m.ProfesorCategoriaListComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Lista de Categorías de Profesores',
      roles: ['ADMIN', 'MODERATOR' ,'TUTOR']
    }
  }
]; 