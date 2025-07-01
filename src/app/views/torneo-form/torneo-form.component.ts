import { Component, OnInit } from '@angular/core';
import { Torneo } from '../../models/torneo';
import { ActivatedRoute, Router } from '@angular/router';
import { TorneoService } from '../../services/torneo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-torneo-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './torneo-form.component.html',
  styleUrl: './torneo-form.component.scss'
})
export class TorneoFormComponent implements OnInit {
  accion: string = "";
  torneo!: Torneo;

  constructor(private activatedRoute: ActivatedRoute, private torneoService: TorneoService, private router: Router) {
    this.iniciarVariable();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['id'] == "0") {
        this.accion = "new";
        this.iniciarVariable();
      }
      else {
        this.accion = "update";
        this.cargarTorneo(params['id']);
      }
    });
  }

  iniciarVariable() {
    this.torneo = new Torneo();
  }
  formatearFechaParaInput(fecha: string | Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }

  cargarTorneo(id: string) {
    this.torneoService.getTorneo(id).subscribe({
      next: result => {
        Object.assign(this.torneo, result.data);
        this.torneo.fecha_inicio = this.formatearFechaParaInput(this.torneo.fecha_inicio);
      },
      error: error => {
        alert("Ocurrio un error al cargar el torneo");
        console.log(error);
      }
    })
  }

  actualizarTorneo() {
    this.torneoService.updateTorneo(this.torneo).subscribe({
      next: result => {
        if (result.success == true) {
          alert("El torneo se modificó correctamente");
          this.router.navigate(['torneos']);
        }
      },
      error: error => {
        alert("Ocurrio un error al actualizar");
        console.log(error);
      }
    })
  }

  agregarTorneo() {
    this.torneoService.addTorneo(this.torneo).subscribe({
      next: result => {
        if (result.success == true) {
          alert("El torneo se agregó correctamente");
          this.router.navigate(['torneos']);
        }
      },
      error: error => {
        alert("Ocurrio un error al agregar");
        console.log(error);
      }
    })
  }
}
