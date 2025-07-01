import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
    data: {
      title: 'Lista de Usuarios'
    }
  },
  {
    path: 'form',
    loadComponent: () => import('./form/form.component').then(m => m.FormComponent),
    data: {
      title: 'Crear Usuario'
    }
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./form/form.component').then(m => m.FormComponent),
    data: {
      title: 'Editar Usuario'
    }
  }
];
