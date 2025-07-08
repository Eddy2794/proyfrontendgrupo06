import { Component, OnInit } from '@angular/core';
import { Torneo } from '../../models/torneo';
import { ActivatedRoute, Router } from '@angular/router';
import { TorneoService } from '../../services/torneo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
  selector: 'app-torneo-form',
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
    AlertComponent],
  templateUrl: './torneo-form.component.html',
  styleUrl: './torneo-form.component.scss'
})
export class TorneoFormComponent implements OnInit {
  accion: string = "";
  torneo!: Torneo;
  formValidado = false;
  tituloForm: string = "";
  fechaMinima: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarExito: boolean = false;
  mostrarError: boolean = false;
  enviandoFormulario: boolean = false;
  @ViewChild('formTorneo') formTorneo!: NgForm;
  constructor(private activatedRoute: ActivatedRoute, private torneoService: TorneoService, private router: Router) {
    this.iniciarVariable();
  }

  ngOnInit(): void {
    this.fechaMinima = new Date().toISOString().split('T')[0]; // formato: "YYYY-MM-DD"

    this.activatedRoute.params.subscribe(params => {
      if (params['id'] == "0") {
        this.accion = "new";
        this.tituloForm = "Completar los datos del nuevo torneo"
        this.iniciarVariable();
      }
      else {
        this.accion = "update";
        this.tituloForm = "Modificar los datos del torneo"
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

  ocultarAlerta() {
    setTimeout(() => {
      this.mostrarExito = false;
      this.mostrarError = false;
    }, 2000);
  }
  originalTorneo!: Torneo;
  cargarTorneo(id: string) {
    this.torneoService.getTorneo(id).subscribe({
      next: result => {
        Object.assign(this.torneo, result.data);
        this.torneo.fecha_inicio = this.formatearFechaParaInput(this.torneo.fecha_inicio);
        this.originalTorneo = JSON.parse(JSON.stringify(this.torneo));
      },
      error: error => {
        alert("Ocurrio un error al cargar el torneo");
        console.log(error);
      }
    })
  }
  private torneoIgual(): boolean {
    return JSON.stringify(this.originalTorneo) === JSON.stringify(this.torneo);
  }
  actualizarTorneo() {
    this.formValidado = true;
    if (this.formTorneo.invalid) {
      this.enviandoFormulario = false;
      return;
    }
    this.enviandoFormulario = true;
    if (this.torneoIgual()) {
      this.mensajeError = "No se realizaron cambios en el formulario";
      this.mostrarError = true;
      this.ocultarAlerta();
      this.enviandoFormulario = false;
      return;
    }
    this.torneoService.updateTorneo(this.torneo).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "El torneo se modificó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();

          setTimeout(() => {
            this.router.navigate(['torneos']);
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

  agregarTorneo() {
    this.formValidado = true;
    if (this.formTorneo.invalid) {
      this.enviandoFormulario = false;
      return;
    }
    this.enviandoFormulario = true;
    this.torneoService.addTorneo(this.torneo).subscribe({
      next: result => {
        if (result.success == true) {
          this.mensajeExito = "El torneo se agregó correctamente";
          this.mostrarExito = true;
          this.ocultarAlerta();
          setTimeout(() => {
            this.router.navigate(['torneos']);
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
