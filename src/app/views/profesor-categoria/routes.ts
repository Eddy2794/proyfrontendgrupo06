import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profesor-categoria-form/profesor-categoria-form.component').then(m => m.ProfesorCategoriaFormComponent),
    data: {
      title: 'Asignar Categoría'
    }
  },
  {
    path: 'lista',
    loadComponent: () => import('./profesor-categoria-list/profesor-categoria-list.component').then(m => m.ProfesorCategoriaListComponent),
    data: {
      title: 'Lista de Categorías de Profesores'
    }
  }
]; 