import { Routes } from '@angular/router';
import { CategoriaComponent } from './categoria.component';
import {hasRoleGuard} from '../../guards/has-role.guard'

export const routes: Routes = [
  {
    path: '',
    component: CategoriaComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Gestión de Categorías',
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    }
  }
];