import { Routes } from '@angular/router';
import { TorneoCategoriaComponent } from './torneo-categoria.component';
import {hasRoleGuard} from '../../guards/has-role.guard';
export const routes: Routes = [
  {
    path: '',
    component: TorneoCategoriaComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Asignar torneos a categorias',
      roles: ['ADMIN', 'MODERATOR' ,'TUTOR']
    }
  }
];