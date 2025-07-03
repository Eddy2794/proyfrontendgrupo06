import { Component, OnInit } from '@angular/core';
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
import { type ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
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
    ModalTitleDirective,
    ChartjsComponent
  ],
  templateUrl: './torneo.component.html',
  styleUrl: './torneo.component.scss'
})
export class TorneoComponent implements OnInit {
  torneos: Torneo[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;

  data: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Torneos por mes',
        backgroundColor: '#f87979',
        data: []
      }
    ]
  };
  constructor(private torneoService: TorneoService, private router: Router) {
    this.getTorneos();
  }

  ngOnInit(): void {
    this.torneoService.getTorneos().subscribe({
      next: result => {
        const torneos = result.data;
        const conteoPorMes = new Array(12).fill(0); // enero a diciembre

        torneos.forEach((torneo: any) => {
          let fecha: Date | null = null;

          if (typeof torneo.fecha_inicio === 'string') {
            fecha = new Date(torneo.fecha_inicio);
          } else if (torneo.fecha_inicio?.$date) {
            fecha = new Date(torneo.fecha_inicio.$date);
          }

          if (fecha && !isNaN(fecha.getTime())) {
            const mes = fecha.getMonth(); // 0 = enero
            conteoPorMes[mes]++;
          }
        });

        this.data = {
          labels: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ],
          datasets: [{
            label: 'Torneos por mes',
            backgroundColor: '#f87979',
            data: conteoPorMes
          }]
        };
      },
      error: err => {
        console.error('Error al cargar torneos', err);
      }
    });
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
