import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./alumno-categoria-list/alumno-categoria-list.component').then(m => m.AlumnoCategoriaListComponent)
  },
  {
    path: 'alumno-categoria-form/:id',
    loadComponent: () => import('./alumno-categoria-form/alumno-categoria-form.component').then(m => m.AlumnoCategoriaFormComponent)
  }
]; 