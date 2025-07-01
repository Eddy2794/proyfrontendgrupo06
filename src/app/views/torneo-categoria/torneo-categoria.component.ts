import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {TorneoCategoriaService} from '../../services/torneo-categoria.service'
import {TorneoCategoria} from '../../models/torneo-categoria';

@Component({
  selector: 'app-torneo-categoria',
  imports: [FormsModule, CommonModule],
  templateUrl: './torneo-categoria.component.html',
  styleUrl: './torneo-categoria.component.scss'
})
export class TorneoCategoriaComponent {

  torneosCategorias: TorneoCategoria[] = [];

  constructor(private torneoCategoriaService: TorneoCategoriaService, private router: Router) {
    this.getTorneosCategorias();
  }


  getTorneosCategorias() {
    this.torneoCategoriaService.getTorneosCategorias().subscribe({
      next: (result) => {
        this.torneosCategorias = result.data.data;
      },
      error: (err) => {
        console.error('Error al cargar torneos-categorias:', err);
      }
    })
  }
  agregar() {
    this.router.navigate(['torneo-categoria-form', '0']);
  }

  modificar(torneoCategoria: TorneoCategoria) {
    this.router.navigate(['torneo-categoria-form', torneoCategoria._id]);
  }


  eliminarTorneoCategoria(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar este asignacion?')) {
      this.torneoCategoriaService.deleteTorneo(id).subscribe({
        next: result => {
          if (result.success == true) {
            alert("La asignacion se eliminó correctamente");
            this.getTorneosCategorias();
          }
        },
        error: error => {
          alert("Ocurrio un error al eliminar");
          console.log(error);
        }
      })
    }
  }

}
