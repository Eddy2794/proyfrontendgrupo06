import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadComponent: () => import('./alumno-list/alumno-list.component').then(m => m.AlumnoListComponent),
    data: {
      title: 'Lista de Alumnos'
    }
  },
  {
    path: 'crear',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    data: {
      title: 'Crear Nuevo Alumno'
    }
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    data: {
      title: 'Editar Alumno'
    }
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    data: {
      title: 'Formulario de Alumno'
    }
  }
]; 