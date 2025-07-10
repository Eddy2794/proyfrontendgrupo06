import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pagos.component').then(m => m.PagosComponent),
    data: {
      title: 'Pagos'
    }
  },
  {
    path: 'realizar-pago',
    loadComponent: () => import('./realizar-pago/realizar-pago.component').then(m => m.RealizarPagoComponent),
    data: {
      title: 'Realizar Pago'
    }
  },
  {
    path: 'historial',
    loadComponent: () => import('./historial-pagos/historial-pagos.component').then(m => m.HistorialPagosComponent),
    data: {
      title: 'Historial de Pagos'
    }
  },
  {
    path: 'pago-qr',
    loadComponent: () => import('./pago-qr/pago-qr.component').then(m => m.PagoQrComponent),
    data: {
      title: 'Pago con QR'
    }
  },
  {
    path: 'pago/:id',
    loadComponent: () => import('./detalle-pago/detalle-pago.component').then(m => m.DetallePagoComponent),
    data: {
      title: 'Detalle de Pago'
    }
  }
];
