import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadComponent: () => import('./alumno-list/alumno-list.component').then(m => m.AlumnoListComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Lista de Alumnos',
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    }
  },
  {
    path: 'crear',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Crear Nuevo Alumno',
      roles: ['ADMIN', 'MODERATOR']
    }
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Editar Alumno',
      roles: ['ADMIN', 'MODERATOR']
    }
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Formulario de Alumno',
      roles: ['ADMIN', 'MODERATOR']
    }
  }
]; 