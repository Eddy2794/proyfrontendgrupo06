import { Component, OnInit } from '@angular/core';
import { Categoria, NIVELES, DIAS_SEMANA, Horario } from '../../models/categoria';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ToastComponent } from '@coreui/angular';
import { NotificationService } from '../../services/notification.service';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { ColorModeService } from '@coreui/angular';

@Component({
  selector: 'app-categoria-form',
  imports: [FormsModule, CommonModule, IconDirective, ToastComponent, NotificationsComponent],
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
    private router: Router,
    private notificationService: NotificationService,
    private colorModeService: ColorModeService
  ) {
    this.iniciarVariable();
  }

  get isDarkTheme(): boolean {
    return this.colorModeService.colorMode() === 'dark';
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
        this.showErrorToast('Error al cargar categoría', 'No se pudo cargar la información de la categoría');
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
          this.showSuccessToast('Categoría actualizada', 'La categoría se modificó correctamente');
          this.router.navigate(['categorias']);
        }
        this.loading = false;
      },
      error: error => {
        this.showErrorToast('Error al actualizar', 'No se pudo actualizar la categoría');
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
          this.showSuccessToast('Categoría creada', 'La nueva categoría se agregó correctamente');
          this.router.navigate(['categorias']);
        }
        this.loading = false;
      },
      error: error => {
        this.showErrorToast('Error al crear', 'No se pudo crear la categoría');
        console.log(error);
        this.loading = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.categoria.nombre.trim()) {
      this.showErrorToast('Campo requerido', 'El nombre de la categoría es obligatorio');
      return false;
    }

    if (this.categoria.edad_min >= this.categoria.edad_max) {
      this.showErrorToast('Error en edades', 'La edad mínima debe ser menor que la edad máxima');
      return false;
    }

    if (this.categoria.cuota_mensual < 0) {
      this.showErrorToast('Error en cuota', 'La cuota mensual no puede ser negativa');
      return false;
    }

    if (this.categoria.max_alumnos < 1) {
      this.showErrorToast('Error en capacidad', 'El máximo de alumnos debe ser al menos 1');
      return false;
    }

    // Validar horarios
    for (let horario of this.categoria.horarios) {
      if (!horario.dia || !horario.hora_inicio || !horario.hora_fin) {
        this.showErrorToast('Error en horarios', 'Todos los campos de horario son requeridos');
        return false;
      }

      if (horario.hora_inicio >= horario.hora_fin) {
        this.showErrorToast('Error en horarios', 'La hora de inicio debe ser menor que la hora de fin');
        return false;
      }
    }

    return true;
  }

  showSuccessToast(title: string, message: string) {
    this.notificationService.showSuccess(title, message);
  }

  showErrorToast(title: string, message: string) {
    this.notificationService.showError(title, message);
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