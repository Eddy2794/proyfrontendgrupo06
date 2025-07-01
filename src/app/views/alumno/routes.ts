import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./alumno.component').then(m => m.AlumnoComponent),
    data: {
      title: 'Gestión de Alumnos'
    }
  },
  {
    path: 'alumno-form/:id',
    loadComponent: () => import('./alumno-form/alumno-form.component').then(m => m.AlumnoFormComponent),
    data: {
      title: 'Formulario de Alumno'
    }
  }
]; 