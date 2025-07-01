import { Routes } from '@angular/router';
import { TorneoCategoriaComponent } from './torneo-categoria.component';

export const routes: Routes = [
  {
    path: '',
    component: TorneoCategoriaComponent,
    data: {
      title: 'Asignar torneos a categorias'
    }
  }
];