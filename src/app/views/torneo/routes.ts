import { Routes } from '@angular/router';
import { TorneoComponent } from './torneo.component';

export const routes: Routes = [
  {
    path: '',
    component: TorneoComponent,
    data: {
      title: 'Gestión de Torneos'
    }
  }
];
