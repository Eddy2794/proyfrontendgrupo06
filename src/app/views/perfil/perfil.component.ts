import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// CoreUI Imports
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ButtonDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  FormSelectDirective,
  AvatarComponent,
  BadgeComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  TabsComponent,
  TabsListComponent,
  TabDirective,
  TabsContentComponent,
  TabPanelComponent,
  ProgressComponent,
  AlertComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// Models y servicios
import { User, UserModel, USER_ROLES, USER_STATES } from '../../models/user.model';
import { Persona, PersonaModel, TIPOS_DOCUMENTO, GENEROS } from '../../models/persona.model';
import { AuthService } from '../../services/auth.service';
import { UserService, UpdateProfileRequest, ChangePasswordRequest } from '../../services/user.service';

@Component({
  selector: 'app-perfil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    FormSelectDirective,
    AvatarComponent,
    BadgeComponent,
    ListGroupDirective,
    ListGroupItemDirective,
    TabsComponent,
    TabsListComponent,
    TabDirective,
    TabsContentComponent,
    TabPanelComponent,
    ProgressComponent,
    AlertComponent,
    IconDirective
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estado del componente
  currentUser: User | null = null;
  currentPersona: Persona | null = null;
  alumnosACargo: User[] = [];
  isEditing = false;
  isLoading = false;
  isLoadingAlumnos = false;
  isUploadingImage = false;
  error: string | null = null;
  success: string | null = null;
  
  // Formularios
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  // Opciones para los selects
  tiposDocumento = TIPOS_DOCUMENTO;
  generos = GENEROS;
  userRoles = USER_ROLES;
  userStates = USER_STATES;
  
  // Tabs
  activeTab = 'personal';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      // Datos de persona
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      telefono: ['', [Validators.minLength(7), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      
      // Dirección
      calle: [''],
      ciudad: [''],
      departamento: [''],
      codigoPostal: [''],
      pais: [''],
      
      // Configuraciones de usuario
      notificacionesEmail: [true],
      notificacionesPush: [false],
      perfilPublico: [false],
      tema: ['auto']
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;
    
    // Intentar obtener el perfil actualizado del backend
    this.userService.getCurrentProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
            this.currentPersona = response.data.persona as Persona;
            this.populateForm();
            this.isLoading = false;
            
            // Cargar alumnos a cargo si es tutor
            if (this.isTutor) {
              this.loadAlumnosACargo();
            }
          } else {
            // Fallback: usar datos del authService
            this.loadFromAuthService();
          }
        },
        error: (error) => {
          console.error('Error al cargar perfil desde backend:', error);
          // Fallback: usar datos del authService
          this.loadFromAuthService();
        }
      });
  }

  private loadFromAuthService(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.currentPersona = user.persona as Persona;
          this.populateForm();
          this.isLoading = false;
          
          // Cargar alumnos a cargo si es tutor
          if (this.isTutor) {
            this.loadAlumnosACargo();
          }
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.error = 'Error al cargar el perfil del usuario.';
          this.isLoading = false;
        }
      });
  }

  private populateForm(): void {
    if (!this.currentPersona || !this.currentUser) return;

    this.profileForm.patchValue({
      // Datos de persona
      nombres: this.currentPersona.nombres,
      apellidos: this.currentPersona.apellidos,
      tipoDocumento: this.currentPersona.tipoDocumento,
      numeroDocumento: this.currentPersona.numeroDocumento,
      fechaNacimiento: this.formatDate(this.currentPersona.fechaNacimiento),
      genero: this.currentPersona.genero,
      telefono: this.currentPersona.telefono || '',
      email: this.currentPersona.email,
      
      // Dirección
      calle: this.currentPersona.direccion?.calle || '',
      ciudad: this.currentPersona.direccion?.ciudad || '',
      departamento: this.currentPersona.direccion?.departamento || '',
      codigoPostal: this.currentPersona.direccion?.codigoPostal || '',
      pais: this.currentPersona.direccion?.pais || '',
      
      // Configuraciones de usuario
      notificacionesEmail: this.currentUser.configuraciones?.notificacionesEmail ?? true,
      notificacionesPush: this.currentUser.configuraciones?.notificacionesPush ?? false,
      perfilPublico: this.currentUser.configuraciones?.perfilPublico ?? false,
      tema: this.currentUser.configuraciones?.temaOscuro ? 'dark' : 'light'
    });

    // Deshabilitar todos los campos inicialmente (solo se habilitan en modo edición)
    if (!this.isEditing) {
      this.disableAllFields();
    }
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      // Habilitar campos según permisos
      this.updateFieldStates();
    } else {
      // Deshabilitar todos los campos y restaurar valores originales
      this.disableAllFields();
      this.populateForm();
      this.error = null;
      this.success = null;
    }
  }

  private updateFieldStates(): void {
    // Habilitar todos los campos primero
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.enable();
    });

    // Deshabilitar campos específicos según permisos
    if (!this.canEditField('numeroDocumento')) {
      this.profileForm.get('numeroDocumento')?.disable();
    }
    if (!this.canEditField('tipoDocumento')) {
      this.profileForm.get('tipoDocumento')?.disable();
    }
  }

  private disableAllFields(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.disable();
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.error = 'Por favor, complete todos los campos obligatorios correctamente.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const formData = this.profileForm.value;
    
    // Construir los datos a actualizar
    const updateData = {
      persona: {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        telefono: formData.telefono || undefined,
        email: formData.email,
        direccion: this.buildAddress(formData)
      },
      configuraciones: {
        notificaciones: {
          email: formData.notificacionesEmail,
          push: formData.notificacionesPush
        },
        privacidad: {
          perfilPublico: formData.perfilPublico
        },
        tema: formData.tema
      }
    };

    // Actualizar perfil usando el servicio real
    this.userService.updateProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = response.message || 'Perfil actualizado exitosamente.';
            this.isEditing = false;
            this.isLoading = false;
            
            // Actualizar los datos locales con la respuesta del servidor
            if (response.data) {
              this.currentUser = response.data;
              this.currentPersona = response.data.persona as Persona;
              this.populateForm(); // Actualizar formulario con nuevos datos
            }
          } else {
            this.error = response.message || 'Error al actualizar el perfil.';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          this.error = error.error?.message || 'Error al actualizar el perfil. Intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;
    
    const passwordData: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    // Cambiar contraseña usando el servicio real
    this.userService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = response.message || 'Contraseña actualizada exitosamente.';
            this.passwordForm.reset();
            this.isLoading = false;
          } else {
            this.error = response.message || 'Error al cambiar la contraseña.';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error al cambiar contraseña:', error);
          this.error = error.error?.message || 'Error al cambiar la contraseña. Intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  private buildAddress(formData: any): any {
    const hasAddressData = formData.calle || formData.ciudad || formData.departamento || 
                          formData.codigoPostal || formData.pais;
    
    if (!hasAddressData) return undefined;
    
    return {
      calle: formData.calle || undefined,
      ciudad: formData.ciudad || undefined,
      departamento: formData.departamento || undefined,
      codigoPostal: formData.codigoPostal || undefined,
      pais: formData.pais || undefined
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  isFieldInvalid(fieldName: string, form: FormGroup = this.profileForm): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string, form: FormGroup = this.profileForm): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['passwordsMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  // Getters para la vista
  get userRoleLabel(): string {
    const role = this.userRoles.find(r => r.value === this.currentUser?.rol);
    return role?.label || 'Usuario';
  }

  get userStateBadgeColor(): string {
    switch (this.currentUser?.estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'secondary';
      case 'SUSPENDIDO': return 'danger';
      case 'PENDIENTE_VERIFICACION': return 'warning';
      default: return 'secondary';
    }
  }

  get completionPercentage(): number {
    if (!this.currentPersona) return 0;
    
    const fields = [
      this.currentPersona.nombres,
      this.currentPersona.apellidos,
      this.currentPersona.email,
      this.currentPersona.numeroDocumento,
      this.currentPersona.fechaNacimiento,
      this.currentPersona.telefono,
      this.currentPersona.direccion?.ciudad
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Obtener la URL de la imagen de perfil o avatar por defecto
   */
  get profileImageUrl(): string {
    return this.currentUser?.imagenPerfil || './assets/images/avatars/avatar.png';
  }

  /**
   * Verificar si el usuario tiene imagen personalizada
   */
  get hasCustomImage(): boolean {
    return !!this.currentUser?.imagenPerfil;
  }

  // Métodos adicionales para funcionalidad específica

  /**
   * Verificar si el usuario es tutor
   */
  get isTutor(): boolean {
    return this.currentUser?.rol === 'MODERATOR'; // MODERATOR actúa como tutor en este sistema
  }

  /**
   * Verificar si el usuario es administrador
   */
  get isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMIN';
  }

  /**
   * Verificar si el usuario es alumno
   */
  get isAlumno(): boolean {
    return this.currentUser?.rol === 'USER'; // USER actúa como alumno en este sistema
  }

  /**
   * Cargar alumnos a cargo (para tutores)
   */
  loadAlumnosACargo(): void {
    if (!this.isTutor) return;

    this.isLoadingAlumnos = true;
    this.userService.getAlumnosACargo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.alumnosACargo = response.data;
          }
          this.isLoadingAlumnos = false;
        },
        error: (error) => {
          console.error('Error al cargar alumnos a cargo:', error);
          this.isLoadingAlumnos = false;
        }
      });
  }

  /**
   * Verificar si se puede editar un campo específico
   */
  canEditField(fieldName: string): boolean {
    // Los administradores pueden editar todo
    if (this.isAdmin) return true;

    // Campos que no se pueden editar una vez establecidos
    const restrictedFields = ['numeroDocumento', 'tipoDocumento'];
    
    if (restrictedFields.includes(fieldName)) {
      // Solo se puede editar si está vacío
      const currentValue = this.currentPersona?.[fieldName as keyof Persona];
      return !currentValue;
    }

    return true;
  }

  /**
   * Mostrar información específica según el rol
   */
  getSpecificRoleInfo(): string {
    switch (this.currentUser?.rol) {
      case 'USER':
        return 'Como alumno, puedes ver tus cursos, calificaciones y comunicarte con tus tutores.';
      case 'MODERATOR':
        return `Como tutor, puedes gestionar a ${this.alumnosACargo.length} alumno(s) a tu cargo.`;
      case 'ADMIN':
        return 'Como administrador, tienes acceso completo a todas las funcionalidades del sistema.';
      default:
        return '';
    }
  }

  /**
   * Obtener URL del avatar basado en el nombre del usuario
   */
  getAvatarUrl(): string {
    if (!this.currentPersona) return '';
    
    const initials = `${this.currentPersona.nombres?.charAt(0) || ''}${this.currentPersona.apellidos?.charAt(0) || ''}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d6efd&color=fff&size=150`;
  }

  /**
   * Manejar cambio de tab
   */
  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.error = null;
    this.success = null;

    // Cargar datos específicos según el tab
    if (tab === 'tutoria' && this.isTutor && this.alumnosACargo.length === 0) {
      this.loadAlumnosACargo();
    }
  }

  /**
   * Manejar selección de archivo de imagen
   */
  onImageFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Formato de imagen no válido. Solo se permiten JPEG, PNG, GIF, WEBP';
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.error = 'La imagen es demasiado grande. Máximo 5MB';
      return;
    }

    // Convertir a base64 y subir
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      this.uploadProfileImage(base64Image);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Subir imagen de perfil
   */
  private uploadProfileImage(base64Image: string): void {
    this.isUploadingImage = true;
    this.error = null;

    this.userService.updateProfileImage(base64Image)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
            // Actualizar también el servicio de autenticación para que se refleje en el header
            this.authService.updateCurrentUser(response.data);
            this.success = 'Imagen de perfil actualizada exitosamente';
          }
          this.isUploadingImage = false;
        },
        error: (error) => {
          console.error('Error subiendo imagen:', error);
          this.error = error?.error?.message || 'Error al subir la imagen';
          this.isUploadingImage = false;
        }
      });
  }

  /**
   * Eliminar imagen de perfil
   */
  removeProfileImage(): void {
    this.isUploadingImage = true;
    this.error = null;

    this.userService.removeProfileImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
            // Actualizar también el servicio de autenticación para que se refleje en el header
            this.authService.updateCurrentUser(response.data);
            this.success = 'Imagen de perfil eliminada exitosamente';
          }
          this.isUploadingImage = false;
        },
        error: (error) => {
          console.error('Error eliminando imagen:', error);
          this.error = error?.error?.message || 'Error al eliminar la imagen';
          this.isUploadingImage = false;
        }
      });
  }

  /**
   * Activar selector de archivo
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    fileInput?.click();
  }
}
