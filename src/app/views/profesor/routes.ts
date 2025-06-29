import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profesor.component').then(m => m.ProfesorComponent),
    data: {
      title: 'Gestión de Profesores'
    }
  }
]; 