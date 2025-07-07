import { Component, OnInit } from '@angular/core';
import { Categoria, CategoriaClass, NIVELES, DIAS_SEMANA, TIPOS_CATEGORIA, Horario } from '../../models/categoria';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { ProfesorService } from '../../services/profesor.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { 
  ToastComponent,
  FormDirective,
  FormControlDirective,
  FormSelectDirective
} from '@coreui/angular';
import { NotificationService } from '../../services/notification.service';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { ColorModeService } from '@coreui/angular';

@Component({
  selector: 'app-categoria-form',
  imports: [
    FormsModule, 
    CommonModule, 
    IconDirective, 
    NotificationsComponent,
    FormDirective,
    FormControlDirective,
    FormSelectDirective
  ],
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.scss'
})
export class CategoriaFormComponent implements OnInit {
  accion: string = "";
  categoria!: Categoria;
  niveles = NIVELES;
  diasSemana = DIAS_SEMANA;
  tiposCategoria = TIPOS_CATEGORIA;
  loading = false;
  profesores: any[] = [];
  loadingProfesores = false;
  categoriaFormValidated = false;



  constructor(
    private activatedRoute: ActivatedRoute, 
    private categoriaService: CategoriaService,
    private profesorService: ProfesorService,
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
    this.cargarProfesores();
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
    this.categoria = new CategoriaClass();
    this.categoriaFormValidated = false;
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
    this.categoriaService.updateCategoria(this.categoria._id!, this.categoria).subscribe({
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

    // Preparar datos solo con los campos requeridos por el backend
    const categoriaData = {
      nombre: this.categoria.nombre,
      descripcion: this.categoria.descripcion || '',
      edadMinima: this.categoria.edadMinima,
      edadMaxima: this.categoria.edadMaxima,
      tipo: this.categoria.tipo,
      estado: this.categoria.estado,
      precio: {
        cuotaMensual: this.categoria.precio.cuotaMensual,
        descuentos: this.categoria.precio.descuentos
      },
      cupoMaximo: this.categoria.cupoMaximo,
      nivel: this.categoria.nivel,
      horarios: this.categoria.horarios
    };

    console.log('Datos de categoría a enviar:', categoriaData);
    this.loading = true;
    this.categoriaService.addCategoria(categoriaData).subscribe({
      next: result => {
        if (result.success) {
          this.showSuccessToast('Categoría creada', 'La nueva categoría se agregó correctamente');
          this.router.navigate(['categorias']);
        }
        this.loading = false;
      },
      error: error => {
        console.error('Error completo del backend:', error);
        if (error.error && error.error.message) {
          this.showErrorToast('Error al crear', error.error.message);
        } else {
          this.showErrorToast('Error al crear', 'No se pudo crear la categoría');
        }
        this.loading = false;
      }
    });
  }

  guardar() {
    // Marcar el formulario como validado para mostrar errores
    this.categoriaFormValidated = true;
    
    if (this.accion === 'new') {
      this.agregarCategoria();
    } else {
      this.actualizarCategoria();
    }
  }

  validarFormulario(): boolean {
    if (!this.categoria?.nombre?.trim()) {
      this.showErrorToast('Campo requerido', 'El nombre de la categoría es obligatorio');
      return false;
    }

    if (!this.categoria?.tipo) {
      this.showErrorToast('Campo requerido', 'El tipo de categoría es obligatorio');
      return false;
    }

    if ((this.categoria?.edadMinima ?? 0) >= (this.categoria?.edadMaxima ?? 0)) {
      this.showErrorToast('Error en edades', 'La edad mínima debe ser menor que la edad máxima');
      return false;
    }

    if ((this.categoria?.precio?.cuotaMensual ?? 0) < 0) {
      this.showErrorToast('Error en cuota', 'La cuota mensual no puede ser negativa');
      return false;
    }

    if ((this.categoria?.cupoMaximo ?? 0) < 1) {
      this.showErrorToast('Error en capacidad', 'El máximo de alumnos debe ser al menos 1');
      return false;
    }

    // Validar horarios
    if (this.categoria?.horarios) {
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
    if (this.categoria?.horarios) {
      this.categoria.horarios.push({
        dia: 'LUNES',
        hora_inicio: '09:00',
        hora_fin: '10:00'
      });
    }
  }

  eliminarHorario(index: number) {
    if (this.categoria?.horarios) {
      this.categoria.horarios.splice(index, 1);
    }
  }

  cancelar() {
    this.router.navigate(['categorias']);
  }

  cargarProfesores() {
    this.loadingProfesores = true;
    this.profesorService.getProfesoresActivos().subscribe({
      next: (profesores) => {
        this.profesores = profesores || [];
        this.loadingProfesores = false;
      },
      error: (error) => {
        console.error('Error al cargar profesores:', error);
        this.showErrorToast('Error', 'No se pudieron cargar los profesores');
        this.loadingProfesores = false;
      }
    });
  }
}