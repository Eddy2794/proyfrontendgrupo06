import { Component } from '@angular/core';
import { TorneoService } from '../../services/torneo.service';
import { Torneo } from '../../models/torneo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-torneo',
  imports: [FormsModule, CommonModule,
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
  templateUrl: './torneo.component.html',
  styleUrl: './torneo.component.scss'
})
export class TorneoComponent {
  torneos: Torneo[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;
  constructor(private torneoService: TorneoService, private router: Router) {
    this.getTorneos();
  }

  ocultarAlerta() {
    setTimeout(() => {
      this.mostrarExito = false;
      this.mostrarError = false;
    }, 2000);
  }
  getTorneos() {
    this.torneoService.getTorneos().subscribe({
      next: (result) => {
        this.torneos = result.data;
      },
      error: (err) => {
        console.error('Error al cargar torneos:', err);
      }
    });
  }
  agregar() {
    this.router.navigate(['torneo-form', '0']);
  }
  modificar(torneo: Torneo) {
    this.router.navigate(['torneo-form', torneo._id]);
  }
  eliminarTorneo() {
    if (!this.torneoAEliminar || !this.torneoAEliminar._id) return;
    this.torneoService.deleteTorneo(this.torneoAEliminar._id).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "El torneo se eliminó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();
          this.getTorneos();
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
  visible = false;
  torneoAEliminar: Torneo | null = null;

  toggleLiveDemo(torneo?: Torneo) {
    if (torneo) {
      this.torneoAEliminar = torneo;
    }
    this.visible = !this.visible;
  }


  handleLiveDemoChange(event: any) {
    this.visible = event;
  }
}
