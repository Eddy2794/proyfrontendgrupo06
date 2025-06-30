import { Component, OnInit } from '@angular/core';
import { Categoria, NIVELES, DIAS_SEMANA, Horario } from '../../models/categoria';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categoria-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.scss'
})
export class CategoriaFormComponent implements OnInit {
  accion: string = "";
  categoria!: Categoria;
  niveles = NIVELES;
  diasSemana = DIAS_SEMANA;
  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private categoriaService: CategoriaService, 
    private router: Router
  ) {
    this.iniciarVariable();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['id'] == "0") {
        this.accion = "new";
        this.iniciarVariable();
      } else {
        this.accion = "update";
        this.cargarCategoria(params['id']);
      }
    });
  }

  iniciarVariable() {
    this.categoria = new Categoria();
  }

  cargarCategoria(id: string) {
    this.loading = true;
    this.categoriaService.getCategoria(id).subscribe({
      next: result => {
        if (result.success) {
          Object.assign(this.categoria, result.data);
        }
        this.loading = false;
      },
      error: error => {
        alert("Ocurrió un error al cargar la categoría");
        console.log(error);
        this.loading = false;
      }
    });
  }

  actualizarCategoria() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.categoriaService.updateCategoria(this.categoria).subscribe({
      next: result => {
        if (result.success) {
          alert("La categoría se modificó correctamente");
          this.router.navigate(['categorias']);
        }
        this.loading = false;
      },
      error: error => {
        alert("Ocurrió un error al actualizar");
        console.log(error);
        this.loading = false;
      }
    });
  }

  agregarCategoria() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.categoriaService.addCategoria(this.categoria).subscribe({
      next: result => {
        if (result.success) {
          alert("La categoría se agregó correctamente");
          this.router.navigate(['categorias']);
        }
        this.loading = false;
      },
      error: error => {
        alert("Ocurrió un error al agregar");
        console.log(error);
        this.loading = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.categoria.nombre.trim()) {
      alert('El nombre es requerido');
      return false;
    }

    if (this.categoria.edad_min >= this.categoria.edad_max) {
      alert('La edad mínima debe ser menor que la edad máxima');
      return false;
    }

    if (this.categoria.cuota_mensual < 0) {
      alert('La cuota mensual no puede ser negativa');
      return false;
    }

    if (this.categoria.max_alumnos < 1) {
      alert('El máximo de alumnos debe ser al menos 1');
      return false;
    }

    // Validar horarios
    for (let horario of this.categoria.horarios) {
      if (!horario.dia || !horario.hora_inicio || !horario.hora_fin) {
        alert('Todos los campos de horario son requeridos');
        return false;
      }

      if (horario.hora_inicio >= horario.hora_fin) {
        alert('La hora de inicio debe ser menor que la hora de fin');
        return false;
      }
    }

    return true;
  }

  agregarHorario() {
    this.categoria.horarios.push({
      dia: 'LUNES',
      hora_inicio: '09:00',
      hora_fin: '10:00'
    });
  }

  eliminarHorario(index: number) {
    this.categoria.horarios.splice(index, 1);
  }

  cancelar() {
    this.router.navigate(['categorias']);
  }
}