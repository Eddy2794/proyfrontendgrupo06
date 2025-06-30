import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profesor.component').then(m => m.ProfesorComponent),
    data: {
      title: 'Nuevo Profesor'
    }
  },
  {
    path: 'lista',
    loadComponent: () => import('../profesor-list/profesor-list.component').then(m => m.ProfesorListComponent),
    data: {
      title: 'Lista de Profesores'
    }
  }
]; 