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
  equipamientoIncluidoText: string = '';
  equipamientoRequeridoText: string = '';

  // Getters y setters para navegación segura
  get habilitarDescuentos(): boolean {
    return this.categoria?.configuracionPago?.habilitarDescuentos || false;
  }

  set habilitarDescuentos(value: boolean) {
    if (!this.categoria.configuracionPago) {
      this.categoria.configuracionPago = {
        habilitarDescuentos: false,
        metodosPermitidos: ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO']
      };
    }
    this.categoria.configuracionPago.habilitarDescuentos = value;
  }

  get descuentoHermanos(): number {
    return this.categoria?.precio?.descuentos?.hermanos || 0;
  }

  set descuentoHermanos(value: number) {
    if (!this.categoria.precio.descuentos) {
      this.categoria.precio.descuentos = {};
    }
    this.categoria.precio.descuentos.hermanos = value;
  }

  get descuentoPagoAnual(): number {
    return this.categoria?.precio?.descuentos?.pagoAnual || 0;
  }

  set descuentoPagoAnual(value: number) {
    if (!this.categoria.precio.descuentos) {
      this.categoria.precio.descuentos = {};
    }
    this.categoria.precio.descuentos.pagoAnual = value;
  }

  get descuentoPrimeraVez(): number {
    return this.categoria?.precio?.descuentos?.primeraVez || 0;
  }

  set descuentoPrimeraVez(value: number) {
    if (!this.categoria.precio.descuentos) {
      this.categoria.precio.descuentos = {};
    }
    this.categoria.precio.descuentos.primeraVez = value;
  }



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
    this.equipamientoIncluidoText = '';
    this.equipamientoRequeridoText = '';
  }

  cargarCategoria(id: string) {
    this.loading = true;
    this.categoriaService.getCategoria(id).subscribe({
      next: result => {
        if (result.success) {
          Object.assign(this.categoria, result.data);
          // Convertir arrays de equipamiento a texto
          this.equipamientoIncluidoText = this.categoria.equipamiento?.incluido?.join(', ') || '';
          this.equipamientoRequeridoText = this.categoria.equipamiento?.requerido?.join(', ') || '';
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

    // Preparar equipamiento desde texto
    this.prepararEquipamiento();

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

    // Preparar equipamiento desde texto
    this.prepararEquipamiento();

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
      horarios: this.categoria.horarios,
      profesor: this.categoria.profesor,
      configuracionPago: this.categoria.configuracionPago,
      equipamiento: this.categoria.equipamiento
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
    // Validaciones básicas de campos requeridos
    if (!this.categoria?.nombre?.trim()) {
      this.showErrorToast('Campo requerido', 'El nombre de la categoría es obligatorio');
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

  prepararEquipamiento() {
    // Convertir texto a arrays para equipamiento
    if (!this.categoria.equipamiento) {
      this.categoria.equipamiento = { incluido: [], requerido: [] };
    }
    
    this.categoria.equipamiento.incluido = this.equipamientoIncluidoText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    this.categoria.equipamiento.requerido = this.equipamientoRequeridoText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  toggleMetodoPago(metodo: string, event: any) {
    if (!this.categoria.configuracionPago) {
      this.categoria.configuracionPago = {
        habilitarDescuentos: true,
        metodosPermitidos: []
      };
    }

    const metodosPermitidos = this.categoria.configuracionPago.metodosPermitidos;
    
    if (event.target.checked) {
      if (!metodosPermitidos.includes(metodo)) {
        metodosPermitidos.push(metodo);
      }
    } else {
      const index = metodosPermitidos.indexOf(metodo);
      if (index > -1) {
        metodosPermitidos.splice(index, 1);
      }
    }
  }
}