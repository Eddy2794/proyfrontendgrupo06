import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// CoreUI Components
import { 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  ButtonDirective,
  SpinnerComponent,
  FormControlDirective,
  FormSelectDirective,
  FormLabelDirective,
  FormFeedbackComponent,
  AlertComponent,
  RowComponent,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective
} from '@coreui/angular';

// CoreUI Icons
import { IconDirective } from '@coreui/icons-angular';

// Models and Services
import { User, UserRole, UserState, Persona, TipoDocumento, Genero } from '../../../models';
import { UserService } from '../../../services/user.service';
import { PersonaService } from '../../../services/persona.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    SpinnerComponent,
    FormControlDirective,
    FormSelectDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    AlertComponent,
    RowComponent,
    ColComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    IconDirective
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  userForm: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;
  isEditMode = false;
  userId: string | null = null;
  
  // Opciones para selects
  userRoles: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN', 'TUTOR', 'MODERATOR'];
  userStates: UserState[] = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE_VERIFICACION'];
  tiposDocumento: TipoDocumento[] = ['DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA'];
  generos: Genero[] = ['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private personaService: PersonaService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;
    
    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crear el formulario reactivo
   */
  private createForm(): FormGroup {
    return this.fb.group({
      // Datos de usuario
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [Validators.required]],
      rol: ['USER', [Validators.required]],
      estado: ['ACTIVO', [Validators.required]],
      emailVerificado: [false],
      
      // Datos de persona
      persona: this.fb.group({
        nombres: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]],
        apellidos: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]],
        tipoDocumento: ['DNI', [Validators.required]],
        numeroDocumento: ['', [
          Validators.required,
          Validators.pattern('^[0-9]{7,8}$')
        ]],
        fechaNacimiento: ['', [Validators.required]],
        genero: ['PREFIERO_NO_DECIR', [Validators.required]],
        telefono: ['', [
          Validators.pattern('^[+]?[0-9]{8,15}$')
        ]],
        email: ['', [
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ]],
        
        // Dirección (opcional)
        direccion: this.fb.group({
          calle: [''],
          ciudad: [''],
          departamento: [''],
          codigoPostal: [''],
          pais: ['']
        })
      })
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * Validador personalizado para confirmar contraseña
   */
  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Cargar datos del usuario para edición
   */
  private loadUser(userId: string): void {
    this.loading = true;
    this.error = null;

    this.userService.getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.populateForm(response.data);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar el usuario: ' + (error.error?.message || error.message);
          this.loading = false;
        }
      });
  }

  /**
   * Poblar el formulario con datos del usuario
   */
  private populateForm(user: User): void {
    // Hacer que password no sea requerido en modo edición
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    const persona = typeof user.persona === 'object' ? user.persona : null;
    
    this.userForm.patchValue({
      username: user.username,
      rol: user.rol,
      estado: user.estado,
      emailVerificado: user.emailVerificado,
      persona: {
        nombres: persona?.nombres || '',
        apellidos: persona?.apellidos || '',
        tipoDocumento: persona?.tipoDocumento || 'DNI',
        numeroDocumento: persona?.numeroDocumento || '',
        fechaNacimiento: persona?.fechaNacimiento ? 
          new Date(persona.fechaNacimiento).toISOString().split('T')[0] : '',
        genero: persona?.genero || 'PREFIERO_NO_DECIR',
        telefono: persona?.telefono || '',
        email: persona?.email || '',
        direccion: {
          calle: persona?.direccion?.calle || '',
          ciudad: persona?.direccion?.ciudad || '',
          departamento: persona?.direccion?.departamento || '',
          codigoPostal: persona?.direccion?.codigoPostal || '',
          pais: persona?.direccion?.pais || ''
        }
      }
    });
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formData = { ...this.userForm.value };
    
    if (this.isEditMode && this.userId) {
      // En modo edición, preparar datos para actualización
      const updateData: any = {
        username: formData.username,
        rol: formData.rol,
        estado: formData.estado
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password) {
        updateData.password = formData.password;
      }

      this.userService.updateUser(this.userId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess('Usuario actualizado correctamente');
              this.router.navigate(['/user/list']);
            }
            this.submitting = false;
          },
          error: (error) => {
            this.error = 'Error al actualizar el usuario: ' + (error.error?.message || error.message);
            this.notificationService.showError('Error al actualizar usuario');
            this.submitting = false;
          }
        });
    } else {
      // En modo creación, primero crear/buscar la persona, luego crear el usuario
      this.createUserWithPersona(formData);
    }
  }

  /**
   * Crear usuario con persona (flujo completo de creación)
   */
  private createUserWithPersona(formData: any): void {
    const personaData = formData.persona;
    
    // Primero crear la persona
    this.personaService.createPersona(personaData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (personaResponse) => {
          if (personaResponse.success && personaResponse.data) {
            // Crear el usuario con la referencia a la persona
            const userData = {
              persona: personaResponse.data._id!,
              username: formData.username,
              password: formData.password,
              rol: formData.rol
            };

            this.userService.createUser(userData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    this.notificationService.showSuccess('Usuario creado correctamente');
                    this.router.navigate(['/user/list']);
                  }
                  this.submitting = false;
                },
                error: (error) => {
                  this.error = 'Error al crear el usuario: ' + (error.error?.message || error.message);
                  this.notificationService.showError('Error al crear usuario');
                  this.submitting = false;
                }
              });
          }
        },
        error: (error) => {
          this.error = 'Error al crear la persona: ' + (error.error?.message || error.message);
          this.notificationService.showError('Error al crear persona');
          this.submitting = false;
        }
      });
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
      
      if (control && typeof control.value === 'object' && control.value !== null) {
        this.markFormGroupTouched();
      }
    });
  }

  /**
   * Cancelar y volver a la lista
   */
  onCancel(): void {
    this.router.navigate(['/user/list']);
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(fieldPath: string): boolean {
    const field = this.userForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getErrorMessage(fieldPath: string): string {
    const field = this.userForm.get(fieldPath);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) {
      if (fieldPath === 'username') return 'Solo letras, números y guión bajo';
      if (fieldPath === 'password') return 'Debe contener al menos una mayúscula, minúscula, número y símbolo especial';
      if (fieldPath.includes('telefono')) return 'Ingrese un número de teléfono válido';
      if (fieldPath.includes('numeroDocumento')) return 'Debe contener exactamente 6 dígitos numéricos';
    }
    
    return 'Campo inválido';
  }

  /**
   * Verificar si las contraseñas coinciden
   */
  get passwordMismatch(): boolean {
    return !!(this.userForm.hasError('passwordMismatch') && 
           (this.userForm.get('confirmPassword')?.dirty || this.userForm.get('confirmPassword')?.touched));
  }

  /**
   * Obtener título del formulario
   */
  get formTitle(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  }

  /**
   * Obtener texto del botón de envío
   */
  get submitButtonText(): string {
    if (this.submitting) {
      return this.isEditMode ? 'Actualizando...' : 'Creando...';
    }
    return this.isEditMode ? 'Actualizar Usuario' : 'Crear Usuario';
  }
}
