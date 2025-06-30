import { Routes } from '@angular/router';
import { CategoriaComponent } from './categoria.component';

export const routes: Routes = [
  {
    path: '',
    component: CategoriaComponent,
    data: {
      title: 'Gestión de Categorías'
    }
  }
];