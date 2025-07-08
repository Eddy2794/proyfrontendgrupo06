import { Component, OnInit } from '@angular/core';
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
  ModalTitleDirective,
  TooltipDirective
} from '@coreui/angular';
import { type ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
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
    ModalTitleDirective,
    ChartjsComponent,
    TooltipDirective,
    IconDirective
  ],
  templateUrl: './torneo-categoria.component.html',
  styleUrl: './torneo-categoria.component.scss'
})
export class TorneoCategoriaComponent implements OnInit {

  torneosCategorias: TorneoCategoria[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;
  data: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Categorías por torneo',
        backgroundColor: '#42A5F5',
        data: []
      }
    ]
  };
  constructor(private torneoCategoriaService: TorneoCategoriaService, private router: Router) {
    this.getTorneosCategorias();
  }
  cargarChartTorneoCategoria(){
    this.torneoCategoriaService.getTorneosCategorias().subscribe({
      next: (response: { data: { data: TorneoCategoria[] } }) => {
        const relaciones = response.data.data.filter(tc => tc.torneo !== null && tc.categoria !== null);
        const conteoPorTorneo: { [nombreTorneo: string]: number } = {};

        for (let relacion of relaciones) {
          const torneo = relacion.torneo;
          if (torneo && torneo.nombre) {
            conteoPorTorneo[torneo.nombre] = (conteoPorTorneo[torneo.nombre] || 0) + 1;
          }
        }

        // Cargar datos al gráfico
        this.data = {
          labels: Object.keys(conteoPorTorneo),
          datasets: [
            {
              label: 'Categorías por torneo',
              backgroundColor: '#42A5F5',
              data: Object.values(conteoPorTorneo),
            }
          ]
        };

      },
      error: err => {
        console.error('Error al cargar relaciones torneo-categoría:', err);
      }
    });
  }
  ngOnInit(): void {
    this.cargarChartTorneoCategoria();
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
        this.torneosCategorias = result.data.data.filter(tc => tc.torneo !== null && tc.categoria !== null);
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