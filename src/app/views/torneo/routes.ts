import { Routes } from '@angular/router';
import { TorneoComponent } from './torneo.component';
import {hasRoleGuard} from '../../guards/has-role.guard';

export const routes: Routes = [
  {
    path: '',
    component: TorneoComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Gestión de Torneos',
      roles: ['ADMIN', 'MODERATOR' ,'TUTOR']
    }
  }
];
