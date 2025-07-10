import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    canActivate: [hasRoleGuard],
    data: {
      title: 'Perfil',
      roles: ['ADMIN', 'MODERATOR' ,'TUTOR']
    },
    children: [
      {
        path: '',
        redirectTo: 'perfil',
        pathMatch: 'full'
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil.component').then(m => m.PerfilComponent),
        canActivate: [hasRoleGuard],
        data: {
          title: 'Mi Perfil',
          roles: ['ADMIN', 'MODERATOR' ,'TUTOR']
        }
      }
    ]
  }
];
