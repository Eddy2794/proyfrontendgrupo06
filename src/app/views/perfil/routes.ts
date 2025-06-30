import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Perfil'
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
        data: {
          title: 'Mi Perfil'
        }
      }
    ]
  }
];
