import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../services/profesor.service';
import { 
  ContainerComponent, 
  RowComponent,
  ColComponent, 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  ButtonDirective,
  AlertComponent,
  FormDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  RowDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor } from '@angular/common';
import { ProfesorModel } from '../../models/profesor-model';
import { GENEROS, TIPOS_DOCUMENTO } from '../../models/persona.model';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';

interface ValidationResult {
  isValid: boolean;
  message: string;
}
  
@Component({
  standalone: true,
  selector: 'app-profesor',
  imports: [
    FormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    AlertComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormSelectDirective,
    GutterDirective,
    RowDirective,
    IconDirective,
    NgIf,
    NgFor
  ],
  templateUrl: './profesor.component.html',
  styleUrl: './profesor.component.scss'
})
export class ProfesorComponent implements OnInit {
 
  // ===== PROPIEDADES DEL COMPONENTE =====
  profesorFormValidated = false;
  profesor!: ProfesorModel;
  originalProfesorData: any = null; // Para almacenar datos originales en modo edición
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  editingId: string | null = null;
  
  // Errores de duplicados por campo
  emailDuplicado = false;
  dniDuplicado = false;
  
  // Opciones para los selects
  tiposDocumento = TIPOS_DOCUMENTO;
  generos = GENEROS;
  
  // Agregar propiedades para mensajes específicos
  emailDuplicadoMsg = '';
  dniDuplicadoMsg = '';
  
  constructor(
    private profesorService: ProfesorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profesor = new ProfesorModel();
    this.initializeDireccion();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true' && params['id']) {
        this.getProfesorById(params['id']);
      }
    });
  }

  // ===== VALIDACIONES SIMPLIFICADAS =====
  private validarRequerido(value: string, fieldName: string): ValidationResult {
    if (!value?.trim()) {
      return { isValid: false, message: `${fieldName} es requerido.` };
    }
    return { isValid: true, message: '' };
  }

  private validarLongitud(value: string, fieldName: string, min: number, max: number): ValidationResult {
    const trimmed = value.trim();
    if (trimmed.length < min) {
      return { isValid: false, message: `${fieldName} debe tener al menos ${min} caracteres.` };
    }
    if (trimmed.length > max) {
      return { isValid: false, message: `${fieldName} no puede exceder ${max} caracteres.` };
    }
    return { isValid: true, message: '' };
  }

  // ===== MÉTODOS COMBINADOS DE VALIDACIÓN =====
  validarNombresCompleto(): { isValid: boolean; message: string } {
    const required = this.validarRequerido(this.profesor.personaData.nombres, 'Los nombres');
    if (!required.isValid) return required;
    return this.validarLongitud(this.profesor.personaData.nombres, 'Los nombres', 2, 50);
    }

  validarApellidosCompleto(): { isValid: boolean; message: string } {
    const required = this.validarRequerido(this.profesor.personaData.apellidos, 'Los apellidos');
    if (!required.isValid) return required;
    return this.validarLongitud(this.profesor.personaData.apellidos, 'Los apellidos', 2, 50);
  }

  validarTipoDocumentoCompleto(): { isValid: boolean; message: string } {
    return this.validarRequerido(this.profesor.personaData.tipoDocumento,"El tipo de Documento");
  }

  validarNumeroDocumentoCompleto(): { isValid: boolean; message: string } {
    const required = this.validarRequerido(this.profesor.personaData.numeroDocumento, 'El número de documento');
    if (!required.isValid) return required;
    return this.validarLongitud(this.profesor.personaData.numeroDocumento, 'El número de documento', 6, 20);
  }

  validarFechaNacimientoCompleto(): { isValid: boolean; message: string } {
    if (!this.profesor.personaData.fechaNacimiento) {
      return { isValid: false, message: 'La fecha de nacimiento es requerida.' };
    }
    const fecha = typeof this.profesor.personaData.fechaNacimiento === 'string' ? new Date(this.profesor.personaData.fechaNacimiento) : this.profesor.personaData.fechaNacimiento;
    const hoy = new Date();
    const hace90Anios = new Date(hoy.getFullYear() - 90, hoy.getMonth(), hoy.getDate());
    if (fecha > hoy) {
      return { isValid: false, message: 'La fecha de nacimiento no puede ser futura.' };
    }
    if (fecha < hace90Anios) {
      return { isValid: false, message: 'La fecha de nacimiento no puede ser anterior a hace 90 años.' };
    }
    return { isValid: true, message: '' };
  }

  validarGeneroCompleto(): { isValid: boolean; message: string } {
    return this.validarRequerido(this.profesor.personaData.genero, "El género");
  }

  validarTelefonoCompleto(): { isValid: boolean; message: string } {
    if (!this.profesor.personaData.telefono?.trim()) {
      return { isValid: true, message: '' }; // Opcional
    }
    return this.validarLongitud(this.profesor.personaData.telefono, "El teléfono", 7, 15);
  }

  validarEmailCompleto(): { isValid: boolean; message: string } {
    const required = this.validarRequerido(this.profesor.personaData.email, 'El email');
    if (!required.isValid) return required;
    
    const trimmed = this.profesor.personaData.email.trim().toLowerCase();
    if (trimmed.length > 100) {
      return { isValid: false, message: 'El email no puede exceder 100 caracteres.' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'El formato del email no es válido.' };
    }
    
    return { isValid: true, message: '' };
  }

  validarTituloCompleto(): { isValid: boolean; message: string } {
    const required = this.validarRequerido(this.profesor.titulo, 'El título');
    if (!required.isValid) return required;
    return this.validarLongitud(this.profesor.titulo, 'El título', 2, 100);
  }

  validarExperienciaAniosCompleto(): { isValid: boolean; message: string } {
    let value = this.profesor.experiencia_anios;
    if (!value && value !== 0) {
      return { isValid: false, message: 'Los años de experiencia son requeridos.' };
    }
    if (value < 0) {
      return { isValid: false, message: 'Los años de experiencia no pueden ser negativos.' };
    }
    if (value > 50) {
      return { isValid: false, message: 'Los años de experiencia no pueden exceder 50.' };
    }
    return { isValid: true, message: '' };
  }

  validarFechaContratacionCompleto(): { isValid: boolean; message: string } {
    let value = this.profesor.fecha_contratacion;
    if (!value) {
      return { isValid: false, message: 'La fecha de contratación es requerida.' };
    }
    const fecha = typeof value === 'string' ? new Date(value) : value;
    const hoy = new Date();
    const hace65Anios = new Date(hoy.getFullYear() - 65, hoy.getMonth(), hoy.getDate());
    if (fecha > hoy) {
      return { isValid: false, message: 'La fecha de contratación no puede ser futura.' };
    }
    if (fecha < hace65Anios) {
      return { isValid: false, message: 'La fecha de contratación no puede ser anterior a hace 65 años.' };
    }
    return { isValid: true, message: '' };
  }

  validarSalarioCompleto(): { isValid: boolean; message: string } {
    let value = this.profesor.salario;
    if (!value && value !== 0) {
      return { isValid: false, message: 'El salario es requerido.' };
    }
    if (value < 0) {
      return { isValid: false, message: 'El salario no puede ser negativo.' };
    }
    if (value > 1000000000) {
      return { isValid: false, message: 'El salario no puede exceder 1,000,000.000' };
    }
    return { isValid: true, message: '' };
  }

  esFormularioValido(): boolean {
    return this.validarNombresCompleto().isValid &&
           this.validarApellidosCompleto().isValid &&
           this.validarTipoDocumentoCompleto().isValid &&
           this.validarNumeroDocumentoCompleto().isValid &&
           this.validarFechaNacimientoCompleto().isValid &&
           this.validarGeneroCompleto().isValid &&
           this.validarTelefonoCompleto().isValid &&
           this.validarEmailCompleto().isValid &&
           this.validarTituloCompleto().isValid &&
           this.validarExperienciaAniosCompleto().isValid &&
           this.validarFechaContratacionCompleto().isValid &&
           this.validarSalarioCompleto().isValid;
  }

  // ===== MÉTODOS DE FORMULARIO =====
  private hayCambios(): boolean {
    if (!this.isEditing || !this.originalProfesorData) {
      return true; // En modo creación, siempre hay "cambios"
    }

    // Comparación simple usando JSON.stringify
    const currentDataString = JSON.stringify(this.profesor);
    const originalDataString = JSON.stringify(this.originalProfesorData);
    
    return currentDataString !== originalDataString;
  }

  setSubmittingAnd(action: () => void) {
    this.isSubmitting = true;
    action();
  }

  onSubmit() {
    this.profesorFormValidated = true;

    if (!this.esFormularioValido()) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario antes de continuar.';
      return;
    }

    if (this.isEditing && !this.hayCambios()) {
      this.isSubmitting = true;
      this.successMessage = 'No se realizaron cambios en el formulario.';
      setTimeout(() => {
        this.irALista();
      }, 2000);
      return;
    }
    
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.emailDuplicado = false;
    this.dniDuplicado = false;
    this.emailDuplicadoMsg = '';
    this.dniDuplicadoMsg = '';
    
    if (this.isEditing && this.editingId) {
      this.updateProfesor(this.editingId, this.profesor);
    } else {
      this.createProfesor(this.profesor);
    }
  }

  onReset() {
    this.setSubmittingAnd(() => {
      this.profesor = new ProfesorModel();
      this.originalProfesorData = null;
      this.initializeDireccion();
      this.profesorFormValidated = false;
      this.isEditing = false;
      this.editingId = null;
      this.limpiarErroresDuplicados();
      this.successMessage = '';
      this.errorMessage = '';
      this.isSubmitting = false;
    });
  }

  // ===== MÉTODOS DE CRUD =====
  createProfesor(profesor: any) {
    this.profesorService.createProfesor(profesor).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profesor creado exitosamente';
        setTimeout(() => {
          this.irALista();
          this.isSubmitting = false;
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = '';
        this.emailDuplicado = false;
        this.dniDuplicado = false;
        this.emailDuplicadoMsg = '';
        this.dniDuplicadoMsg = '';
        if (error?.error?.code === 'DUPLICATE_KEY' || error?.error?.code === 'INTERNAL_SERVER_ERROR') {
          const msg = error?.error?.error?.toLowerCase() || '';
          if (msg.includes('email')) {
            this.emailDuplicado = true;
            this.emailDuplicadoMsg = 'El email ya existe';
          }
          if (msg.includes('dni') || msg.includes('documento')) {
            this.dniDuplicado = true;
            this.dniDuplicadoMsg = 'El número de documento ya existe';
          }
        } else {
          this.errorMessage = 'Error al crear el profesor';
        }
      }
    });
  }
  
  updateProfesor(id: string, profesor: any) {
    this.profesorService.updateProfesor(id, profesor).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profesor actualizado exitosamente';
        setTimeout(() => {
          this.irALista();
          this.isSubmitting = false;
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar el profesor';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }
  
  deleteProfesor(id: string) {
    this.setSubmittingAnd(() => {
    if (confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
      this.profesorService.deleteProfesor(id).subscribe({
        next: (response: any) => {
          this.successMessage = 'Profesor eliminado exitosamente';
          setTimeout(() => {
            this.irALista();
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el profesor';
        }
      });
      } else {
        this.isSubmitting = false;
      }
    });
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  irALista() {
      this.router.navigate(['/profesor/lista']);                       
  }

  // ===== MÉTODOS DE CARGA DE DATOS =====
  getProfesorById(id: string) {
    this.profesorService.getProfesor(id).subscribe({
      next: (response: any) => {
        this.mapearProfesorForm(response.data || response);
      },
      error: (error) => {
        console.error('Error al cargar profesor:', error);
        this.errorMessage = 'Error al cargar los datos del profesor';
      }
    });
  }

  mapearProfesorForm(profesor: any) {
    this.isEditing = true;
    this.editingId = profesor._id;
    // Guardar datos originales ANTES de procesarlos
    this.originalProfesorData = ProfesorModel.fromJSON(profesor);
    this.profesor = ProfesorModel.fromJSON(profesor);
  }

  // ===== MÉTODOS DE DIRECCIÓN =====
  private initializeDireccion() {
    if (!this.profesor.personaData.direccion) {
      this.profesor.personaData.direccion = {
        calle: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        pais: ''
      };
    }
  }

  onDireccionChange(field: string, value: string) {
    this.initializeDireccion();
    (this.profesor.personaData.direccion as any)[field] = value;
  }

  // Método para limpiar errores de duplicados
  private limpiarErroresDuplicados() {
    this.emailDuplicado = false;
    this.dniDuplicado = false;
    this.emailDuplicadoMsg = '';
    this.dniDuplicadoMsg = '';
  }

  // Método para limpiar error de email duplicado
  limpiarErrorEmailDuplicado() {
    this.emailDuplicado = false;
    this.emailDuplicadoMsg = '';
  }

  // Método para limpiar error de DNI duplicado
  limpiarErrorDniDuplicado() {
    this.dniDuplicado = false;
    this.dniDuplicadoMsg = '';
  }
}

