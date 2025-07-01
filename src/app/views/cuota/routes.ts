import { Routes } from '@angular/router';
import { CuotaComponent } from './cuota/cuota.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./cuota/cuota.component').then(m => m.CuotaComponent),
    data: {
      title: 'Gestión de Cuotas'
    }
  },
  {
    path: 'cuota-form/:id',
    loadComponent: () => import('./cuota-form/cuota-form.component').then(m => m.CuotaFormComponent),
    data: {
      title: 'Formulario de Cuota'
    }
  }
]; 