import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profesor-list.component').then(m => m.ProfesorListComponent),
    data: {
      title: 'Lista de Profesores'
    }
  }
]; 