import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TorneoCategoriaService } from '../../services/torneo-categoria.service'
import { TorneoCategoria } from '../../models/torneo-categoria';
import {
  TableDirective,
  ColComponent,
  RowComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  AlertComponent,
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective
} from '@coreui/angular';
@Component({
  selector: 'app-torneo-categoria',
  imports: [FormsModule, CommonModule,
    AlertComponent,
    TableDirective,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ColComponent,
    RowComponent,
    AlertComponent,
    ButtonCloseDirective,
    ButtonDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective
  ],
  templateUrl: './torneo-categoria.component.html',
  styleUrl: './torneo-categoria.component.scss'
})
export class TorneoCategoriaComponent {

  torneosCategorias: TorneoCategoria[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;
  constructor(private torneoCategoriaService: TorneoCategoriaService, private router: Router) {
    this.getTorneosCategorias();
  }

  ocultarAlerta() {
    setTimeout(() => {
      this.mostrarExito = false;
      this.mostrarError = false;
    }, 2000);
  }
  getTorneosCategorias() {
    this.torneoCategoriaService.getTorneosCategorias().subscribe({
      next: (result: { data: { data: TorneoCategoria[] } }) => {
        this.torneosCategorias = result.data.data.filter(tc => tc.torneo !== null);
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
  visible = false;
  torneoAEliminar: TorneoCategoria | null = null;

  toggleLiveDemo(torneo?: TorneoCategoria) {
    if (torneo) {
      this.torneoAEliminar = torneo;
    }
    this.visible = !this.visible;
  }


  handleLiveDemoChange(event: any) {
    this.visible = event;
  }
  eliminarTorneoCategoria() {
    if (!this.torneoAEliminar || !this.torneoAEliminar._id) return;
    this.torneoCategoriaService.deleteTorneo(this.torneoAEliminar._id).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "El torneo se eliminó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();
          this.getTorneosCategorias();
        }
      },
      error: error => {
        this.mensajeError = "Ocurrió un error al eliminar";
        this.mostrarError = true;
        this.ocultarAlerta();
        console.log(error);
      }
    })
  }
}