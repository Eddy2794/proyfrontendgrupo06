import { Routes } from '@angular/router';
import {hasRoleGuard} from '../../guards/has-role.guard'
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pagos.component').then(m => m.PagosComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Pagos',
      roles: ['ADMIN', 'TUTOR']
    }
  },
  {
    path: 'realizar-pago',
    loadComponent: () => import('./realizar-pago/realizar-pago.component').then(m => m.RealizarPagoComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Realizar Pago',
      roles: ['ADMIN', 'TUTOR']
    }
  },
  {
    path: 'historial',
    loadComponent: () => import('./historial-pagos/historial-pagos.component').then(m => m.HistorialPagosComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Historial de Pagos',
      roles: ['ADMIN', 'TUTOR']
    }
  },
  {
    path: 'pago/:id',
    loadComponent: () => import('./detalle-pago/detalle-pago.component').then(m => m.DetallePagoComponent),
    canActivate: [hasRoleGuard],
    data: {
      title: 'Detalle de Pago',
      roles: ['ADMIN', 'TUTOR']
    }
  }
];
