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
import {
  AlertComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  FormDirective,
  RowDirective,
  ColComponent,
  RowComponent,
  FormLabelDirective,
  FormControlDirective,
  FormFeedbackComponent,
  ButtonDirective
} from '@coreui/angular';
import { ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-torneo-categoria-form',
  imports: [FormsModule, CommonModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    FormDirective,
    RowDirective,
    ColComponent,
    RowComponent,
    FormLabelDirective,
    FormControlDirective,
    FormFeedbackComponent,
    ButtonDirective,
    AlertComponent
  ],
  templateUrl: './torneo-categoria-form.component.html',
  styleUrl: './torneo-categoria-form.component.scss'
})
export class TorneoCategoriaFormComponent implements OnInit {

  accion: string = "";
  torneos!: Array<Torneo>;
  categorias!: Array<CategoriaAuxiliar>;
  torneoCategoria!: TorneoCategoria;
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;
  tituloForm: string = "";
  formValidado = false;
  enviandoFormulario: boolean = false;
  @ViewChild('formTorneoCategoria') formTorneoCategoria!: NgForm;
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private torneoCategoriaService: TorneoCategoriaService,
    private categoriaService: CategoriaAuxiliarService,
    private torneoService: TorneoService) {
    this.iniciarVariable();
    this.cargarCategorias();
    this.cargarTorneos();
  }

  ocultarAlerta() {
    setTimeout(() => {
      this.mostrarExito = false;
      this.mostrarError = false;
    }, 2000);
  }

  formatearFechaParaInput(fecha: string | Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      console.log(params['id']);
      if (params['id'] == "0") {
        this.accion = "new";
        this.tituloForm = "Completar los datos de la nueva asignación"
        this.iniciarVariable();
      }
      else {
        this.accion = "update";
        this.tituloForm = "Modificar los datos de la asignacion"
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
  originalTorneoCategoria!: TorneoCategoria;
  cargarTorneoCategoria(id: string) {
    this.torneoCategoriaService.getTorneoCategoria(id).subscribe({
      next: result => {
        Object.assign(this.torneoCategoria, result.data);
        this.torneoCategoria.torneo = result.data.torneo._id;
        this.torneoCategoria.categoria = result.data.categoria._id;
        this.originalTorneoCategoria = JSON.parse(JSON.stringify(this.torneoCategoria));
      },
      error: error => {
        console.error("Error cargando torneo-categoría", error);
      }
    });
  }

  private torneoIgual(): boolean {
    return JSON.stringify(this.originalTorneoCategoria) === JSON.stringify(this.torneoCategoria);
  }
  actualizarTorneoCategoria() {
    this.formValidado = true;
    if (this.formTorneoCategoria.invalid) {
      this.enviandoFormulario = false;
      return
    };
    this.enviandoFormulario = true;
    if (this.torneoIgual()) {
      this.mensajeError = "No se realizaron cambios en el formulario";
      this.mostrarError = true;
      this.ocultarAlerta();
      this.enviandoFormulario = false;
      return;
    }
    this.torneoCategoriaService.updateTorneo(this.torneoCategoria).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "La asignacion se modificó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();
          setTimeout(() => {
            this.router.navigate(['torneos-categorias']);
            return;
          }, 2000);

        }
      },
      error: error => {
        this.mensajeError = "Ocurrió un error al actualizar: " + error.error.error;
        this.mostrarError = true;
        this.ocultarAlerta();
        this.enviandoFormulario = false;
        console.log(error);
      }
    })
  }

  agregarTorneoCategoria() {
    this.formValidado = true;
    if (this.formTorneoCategoria.invalid) {
      this.enviandoFormulario = false;
      return
    };
    this.enviandoFormulario = true;
    this.torneoCategoriaService.addTorneo(this.torneoCategoria).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "La asignacion se agregó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();
          setTimeout(() => {
            this.router.navigate(['torneos-categorias']);
            return;
          }, 2000);
        }
      },
      error: error => {
        this.mensajeError = "Ocurrió un error al agregar: " + error.error.error;
        this.mostrarError = true;
        this.ocultarAlerta();
        this.enviandoFormulario = false;
        console.log(error);
      }
    })
  }

}
