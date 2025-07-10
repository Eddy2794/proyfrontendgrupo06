import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./alumno-categoria-list/alumno-categoria-list.component').then(m => m.AlumnoCategoriaListComponent),
    canActivate: [hasRoleGuard],
    data:{
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    }
  },
  {
    path: 'alumno-categoria-form/:id',
    loadComponent: () => import('./alumno-categoria-form/alumno-categoria-form.component').then(m => m.AlumnoCategoriaFormComponent),
    canActivate: [hasRoleGuard],
    data:{
      roles: ['ADMIN', 'MODERATOR']
    }
  }
]; 