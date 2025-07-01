import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TorneoCategoriaService } from '../../services/torneo-categoria.service';
import { TorneoCategoria } from '../../models/torneo-categoria';
import { CategoriaAuxiliarService } from '../../services/categoria-auxiliar.service';
import { TorneoService } from '../../services/torneo.service';
import { Torneo } from '../../models/torneo';
import { CategoriaAuxiliar } from '../../models/categoria-auxiliar';

@Component({
  selector: 'app-torneo-categoria-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './torneo-categoria-form.component.html',
  styleUrl: './torneo-categoria-form.component.scss'
})
export class TorneoCategoriaFormComponent implements OnInit {

  accion: string = "";
  torneos!: Array<Torneo>;
  categorias!: Array<CategoriaAuxiliar>;
  torneoCategoria!: TorneoCategoria;
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private torneoCategoriaService: TorneoCategoriaService,
    private categoriaService: CategoriaAuxiliarService,
    private torneoService: TorneoService) {
    this.iniciarVariable();
    this.cargarCategorias();
    this.cargarTorneos();
  }

  formatearFechaParaInput(fecha: string | Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      console.log(params['id']);
      if (params['id'] == "0") {
        this.accion = "new";
        this.iniciarVariable();
      }
      else {
        this.accion = "update";
        this.cargarTorneoCategoria(params['id']);
      }
    });
  }

  iniciarVariable() {
    this.torneoCategoria = new TorneoCategoria();
    this.torneos = new Array<Torneo>();
    this.categorias = new Array<CategoriaAuxiliar>();
  }

  cargarTorneos() {
    this.torneoService.getTorneos().subscribe({
      next: (result) => {
        this.torneos = result.data;
      },
      error: (err) => {
        console.error('Error al cargar torneos:', err);
      }
    });
  }
  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (result) => {
        this.categorias = result.data.categorias;
      },
      error: (err) => {
        console.error('Error al cargar categorias:', err);
      }
    })
  }

  cargarTorneoCategoria(id: string) {
    this.torneoCategoriaService.getTorneoCategoria(id).subscribe({
      next: result => {
        Object.assign(this.torneoCategoria, result.data);
        this.torneoCategoria.torneo = result.data.torneo._id;
        this.torneoCategoria.categoria = result.data.categoria._id;
      },
      error: error => {
        console.error("Error cargando torneo-categoría", error);
      }
    });
  }


  actualizarTorneoCategoria() {
    this.torneoCategoriaService.updateTorneo(this.torneoCategoria).subscribe({
      next: result => {
        if (result.success == true) {
          alert("La asignacion se modificó correctamente");
          this.router.navigate(['torneos-categorias']);
        }
      },
      error: error => {
        alert("Ocurrio un error al actualizar");
        console.log(error);
      }
    })
  }

  agregarTorneoCategoria() {
    this.torneoCategoriaService.addTorneo(this.torneoCategoria).subscribe({
      next: result => {
        if (result.success == true) {
          alert("La asignacion se modificó correctamente");
          this.router.navigate(['torneos-categorias']);
        }
      },
      error: error => {
        alert("Ocurrio un error al agregar");
        console.log(error);
      }
    })
  }

}
