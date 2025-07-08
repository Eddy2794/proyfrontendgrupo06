import { Component, OnInit } from '@angular/core';
import { Categoria, CategoriaClass, NIVELES, DIAS_SEMANA, TIPOS_CATEGORIA, Horario } from '../../models/categoria';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';

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

  categoriaFormValidated = false;
  originalFormValue: any = null;



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
    this.categoria = new CategoriaClass();
    this.categoriaFormValidated = false;
    this.originalFormValue = null; // En modo creación no hay valor original
  }

  cargarCategoria(id: string) {
    this.loading = true;
    this.categoriaService.getCategoria(id).subscribe({
      next: result => {
        if (result.success) {
          Object.assign(this.categoria, result.data);
          // Asegurar que la estructura de descuentos esté inicializada
          if (!this.categoria.precio.descuentos) {
            this.categoria.precio.descuentos = {
              hermanos: 0,
              pagoAnual: 0,
              primeraVez: 0
            };
          }
          // Guardar copia profunda del valor original para comparación
          this.originalFormValue = JSON.parse(JSON.stringify(this.categoria));
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
        descuentos: {
          pagoAnual: this.categoria.precio.descuentos?.pagoAnual || 0
        }
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
    
    // En modo edición, verificar si hay cambios
    if (this.accion === 'update' && this.originalFormValue) {
      const currentFormValue = JSON.parse(JSON.stringify(this.categoria));
      if (JSON.stringify(currentFormValue) === JSON.stringify(this.originalFormValue)) {
        this.showWarningToast('Sin cambios', 'No se detectaron cambios para guardar.');
        return;
      }
    }
    
    if (this.accion === 'new') {
      this.agregarCategoria();
    } else {
      this.actualizarCategoria();
    }
  }

  validarFormulario(): boolean {
    // Validaciones básicas de campos requeridos
    if (!this.categoria?.nombre?.trim()) {
      this.showErrorToast('Campo requerido', 'El nombre de la categoría es obligatorio');
      return false;
    }

    if (!this.categoria?.descripcion?.trim()) {
      this.showErrorToast('Campo requerido', 'La descripción de la categoría es obligatoria');
      return false;
    }

    if (!this.categoria?.tipo) {
      this.showErrorToast('Campo requerido', 'El tipo de categoría es obligatorio');
      return false;
    }

    if (!this.categoria?.nivel) {
      this.showErrorToast('Campo requerido', 'El nivel de la categoría es obligatorio');
      return false;
    }

    // Validación de longitud del nombre (sincronizada con backend)
    if (this.categoria?.nombre?.trim().length < 2) {
      this.showErrorToast('Error en nombre', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }

    if (this.categoria?.nombre?.trim().length > 100) {
      this.showErrorToast('Error en nombre', 'El nombre no puede exceder 100 caracteres');
      return false;
    }

    // Validación de longitud de la descripción (sincronizada con backend)
    if (this.categoria?.descripcion?.trim().length > 500) {
      this.showErrorToast('Error en descripción', 'La descripción no puede exceder 500 caracteres');
      return false;
    }

    // Validación cruzada de edades (sincronizada con backend)
    const edadMin = this.categoria?.edadMinima ?? 0;
    const edadMax = this.categoria?.edadMaxima ?? 0;
    
    if (edadMin <= 0 || edadMax <= 0) {
      this.showErrorToast('Error en edades', 'Las edades mínima y máxima deben ser mayores a 0');
      return false;
    }

    if (edadMin >= edadMax) {
      this.showErrorToast('Error en edades', 'La edad mínima debe ser menor que la edad máxima');
      return false;
    }

    if (edadMax - edadMin > 15) {
      this.showWarningToast('Advertencia en edades', 'El rango de edades es muy amplio (más de 15 años). Verifique si es correcto.');
    }

    // Límites de edad sincronizados con backend (3-100 años)
    if (edadMin < 3) {
      this.showErrorToast('Error en edad mínima', 'La edad mínima no puede ser menor a 3 años');
      return false;
    }

    if (edadMax > 100) {
      this.showErrorToast('Error en edad máxima', 'La edad máxima no puede ser mayor a 100 años');
      return false;
    }

    // Validación de cuota mensual (sincronizada con backend - permite 0)
    const cuotaMensual = this.categoria?.precio?.cuotaMensual ?? 0;
    
    if (cuotaMensual < 0) {
      this.showErrorToast('Error en cuota', 'La cuota mensual no puede ser negativa');
      return false;
    }

    // Advertencias para valores extremos (pero no errores)
    if (cuotaMensual > 100000) {
      this.showWarningToast('Advertencia en cuota', 'El precio parece muy alto (más de $100.000). Por favor verifique el monto.');
    }

    if (cuotaMensual > 0 && cuotaMensual < 1000) {
      this.showWarningToast('Advertencia en cuota', 'La cuota mensual parece muy baja. Verifique si es correcta.');
    }

    // Validación de capacidad (sincronizada con backend: 1-100 alumnos)
    const cupoMaximo = this.categoria?.cupoMaximo ?? 0;
    
    if (cupoMaximo < 1) {
      this.showErrorToast('Error en capacidad', 'La capacidad mínima debe ser de al menos 1 alumno');
      return false;
    }

    if (cupoMaximo > 100) {
      this.showErrorToast('Error en capacidad', 'La capacidad no puede exceder 100 alumnos');
      return false;
    }

    // Advertencias para valores altos
    if (cupoMaximo > 50) {
      this.showWarningToast('Advertencia en capacidad', 'La capacidad es muy alta (más de 50 alumnos). Verifique si es manejable.');
    }

    // Validación mejorada de horarios
    if (this.categoria?.horarios && this.categoria.horarios.length > 0) {
      for (let i = 0; i < this.categoria.horarios.length; i++) {
        const horario = this.categoria.horarios[i];
        
        if (!horario.dia || !horario.hora_inicio || !horario.hora_fin) {
          this.showErrorToast('Error en horarios', `Todos los campos del horario ${i + 1} son requeridos`);
          return false;
        }

        if (horario.hora_inicio >= horario.hora_fin) {
          this.showErrorToast('Error en horarios', `En el horario ${i + 1}: La hora de inicio debe ser menor que la hora de fin`);
          return false;
        }

        // Validar que no sea muy temprano o muy tarde
        const horaInicio = parseInt(horario.hora_inicio.split(':')[0]);
        const horaFin = parseInt(horario.hora_fin.split(':')[0]);
        
        if (horaInicio < 6) {
          this.showWarningToast('Advertencia en horarios', `El horario ${i + 1} inicia muy temprano (antes de las 6:00 AM)`);
        }
        
        if (horaFin > 23) {
          this.showWarningToast('Advertencia en horarios', `El horario ${i + 1} termina muy tarde (después de las 11:00 PM)`);
        }

        // Verificar duración mínima y máxima
        const duracionHoras = horaFin - horaInicio;
        if (duracionHoras < 1) {
          this.showErrorToast('Error en horarios', `El horario ${i + 1} debe tener una duración mínima de 1 hora`);
          return false;
        }
        
        if (duracionHoras > 4) {
          this.showWarningToast('Advertencia en horarios', `El horario ${i + 1} es muy largo (más de 4 horas). Verifique si es correcto.`);
        }
      }

      // Verificar horarios duplicados
      for (let i = 0; i < this.categoria.horarios.length; i++) {
        for (let j = i + 1; j < this.categoria.horarios.length; j++) {
          if (this.categoria.horarios[i].dia === this.categoria.horarios[j].dia) {
            this.showErrorToast('Error en horarios', `Hay horarios duplicados para el día ${this.categoria.horarios[i].dia}`);
            return false;
          }
        }
      }
    } else {
      this.showErrorToast('Error en horarios', 'Debe agregar al menos un horario de entrenamiento');
      return false;
    }

    return true;
  }

  showSuccessToast(title: string, message: string) {
    this.notificationService.showSuccess(title, message);
  }

  showErrorToast(title: string, message: string) {
    this.notificationService.showError(title, message);
  }

  showWarningToast(title: string, message: string) {
    this.notificationService.showWarning(title, message);
  }

  showInfoToast(title: string, message: string) {
    this.notificationService.showInfo(title, message);
  }

  /**
   * Verificar si el formulario está vacío (solo campos principales)
   */
  get isFormEmpty(): boolean {
    return !this.categoria?.nombre?.trim() && 
           !this.categoria?.descripcion?.trim() &&
           !this.categoria?.tipo &&
           !this.categoria?.nivel &&
           (this.categoria?.edadMinima === 0 || !this.categoria?.edadMinima) &&
           (this.categoria?.edadMaxima === 0 || !this.categoria?.edadMaxima) &&
           (this.categoria?.precio?.cuotaMensual === 0 || !this.categoria?.precio?.cuotaMensual) &&
           (this.categoria?.cupoMaximo === 0 || !this.categoria?.cupoMaximo);
  }

  /**
   * Verificar si el formulario es válido (validación básica)
   */
  get isFormValid(): boolean {
    return !!(this.categoria?.nombre?.trim() &&
             this.categoria?.descripcion?.trim() &&
             this.categoria?.tipo &&
             this.categoria?.nivel &&
             this.categoria?.edadMinima > 0 &&
             this.categoria?.edadMaxima > 0 &&
             this.categoria?.edadMinima < this.categoria?.edadMaxima &&
             this.categoria?.precio?.cuotaMensual >= 0 &&
             this.categoria?.cupoMaximo > 0);
  }

  /**
   * Verificar si hay cambios en modo edición
   */
  get hasChanges(): boolean {
    if (this.accion !== 'update' || !this.originalFormValue) {
      return true; // En modo creación siempre permitir guardar si es válido
    }
    const currentFormValue = JSON.parse(JSON.stringify(this.categoria));
    return JSON.stringify(currentFormValue) !== JSON.stringify(this.originalFormValue);
  }

  /**
   * Determinar si el botón guardar debe estar habilitado
   */
  get canSave(): boolean {
    if (this.loading) {
      return false;
    }
    
    if (this.accion === 'new') {
      return !this.isFormEmpty && this.isFormValid;
    } else {
      return this.isFormValid && this.hasChanges;
    }
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




}