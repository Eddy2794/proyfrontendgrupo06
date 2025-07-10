import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: $localize`Dashboard`,
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    }
  }
];

