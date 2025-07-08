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
import { NotificationService } from '../../services/notification.service';

// Librerías para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    private fb: FormBuilder,
    private notificationService: NotificationService
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

  /**
   * Exportar perfil de usuario a PDF
   */
  exportarPerfilPDF(): void {
    if (!this.currentUser || !this.currentPersona) {
      this.notificationService.showWarning('Advertencia', 'No hay información de perfil para exportar');
      return;
    }

    const elementoTemporal = document.createElement('div');
    elementoTemporal.style.position = 'absolute';
    elementoTemporal.style.left = '-9999px';
    elementoTemporal.style.top = '0';
    elementoTemporal.style.backgroundColor = 'white';
    elementoTemporal.style.padding = '20px';
    elementoTemporal.style.width = '900px';

    const fechaActual = new Date().toLocaleDateString('es-ES');
    const horaActual = new Date().toLocaleTimeString('es-ES');

    // Calcular información adicional
    const fechaNacimiento = this.currentPersona.fechaNacimiento ? 
      new Date(this.currentPersona.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificada';
    
    const edad = this.currentPersona.fechaNacimiento ? 
      new Date().getFullYear() - new Date(this.currentPersona.fechaNacimiento).getFullYear() : 'N/A';
    
    const tipoDocLabel = this.tiposDocumento.find(t => t.value === this.currentPersona?.tipoDocumento)?.label || 'N/A';
    const generoLabel = this.generos.find(g => g.value === this.currentPersona?.genero)?.label || 'N/A';
    const rolLabel = this.userRoles.find(r => r.value === this.currentUser?.rol)?.label || 'N/A';
    const estadoLabel = this.userStates.find(s => s.value === this.currentUser?.estado)?.label || 'N/A';

    // Información de dirección
    const direccion = this.currentPersona.direccion;
    const direccionCompleta = direccion ? 
      `${direccion.calle || ''}, ${direccion.ciudad || ''}, ${direccion.departamento || ''}, ${direccion.pais || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') || 'No especificada' 
      : 'No especificada';

    elementoTemporal.innerHTML = `
      <div style="font-family: Arial, sans-serif; background: white; padding: 20px; line-height: 1.4;">
        <!-- Header con logo prominente -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #28a745; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">9J</span>
            </div>
            <div>
              <h1 style="color: #28a745; margin: 0; font-size: 28px; font-weight: bold;">Club 9 de Julio</h1>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Institución Deportiva</p>
            </div>
          </div>
          <h2 style="color: #333; font-size: 20px; margin: 10px 0;">Perfil de Usuario</h2>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Generado el: ${fechaActual} a las ${horaActual}</p>
        </div>
        
        <!-- Información personal principal -->
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h3 style="color: #17a2b8; margin: 0 0 15px 0; font-size: 18px;">👤 Información Personal</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Nombre Completo:</strong><br>
              <span style="font-size: 14px;">${this.currentPersona.nombres} ${this.currentPersona.apellidos}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Documento:</strong><br>
              <span style="font-size: 14px;">${tipoDocLabel}: ${this.currentPersona.numeroDocumento}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Fecha de Nacimiento:</strong><br>
              <span style="font-size: 14px;">${fechaNacimiento} (${edad} años)</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #28a745;">Género:</strong><br>
              <span style="font-size: 14px;">${generoLabel}</span>
            </div>
          </div>
        </div>
        
        <!-- Información de contacto -->
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📞 Información de Contacto</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Email:</strong><br>
              <span style="font-size: 14px;">${this.currentPersona.email}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #ffc107;">Teléfono:</strong><br>
              <span style="font-size: 14px;">${this.currentPersona.telefono || 'No especificado'}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; grid-column: 1 / -1;">
              <strong style="color: #ffc107;">Dirección:</strong><br>
              <span style="font-size: 14px;">${direccionCompleta}</span>
            </div>
          </div>
        </div>
        
        <!-- Información del sistema -->
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 18px;">⚙️ Información del Sistema</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #17a2b8;">Usuario:</strong><br>
              <span style="font-size: 14px;">${this.currentUser.username}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #17a2b8;">Rol:</strong><br>
              <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; color: white; background: #28a745;">${rolLabel}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #17a2b8;">Estado:</strong><br>
              <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; color: white; background: ${this.currentUser.estado === 'ACTIVO' ? '#28a745' : '#dc3545'};">${estadoLabel}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <strong style="color: #17a2b8;">Fecha de Registro:</strong><br>
              <span style="font-size: 14px;">${this.currentUser.createdAt ? new Date(this.currentUser.createdAt).toLocaleDateString('es-ES') : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        ${this.isTutor && this.alumnosACargo.length > 0 ? `
        <!-- Información de tutoría -->
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">👨‍🏫 Alumnos a Cargo</h3>
          <div style="background: white; padding: 15px; border-radius: 5px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Total de alumnos:</strong> ${this.alumnosACargo.length}</p>
            <div style="font-size: 12px;">
              ${this.alumnosACargo.map(alumno => `
                <div style="padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                  <span><strong>${typeof alumno.persona === 'object' ? (alumno.persona?.nombres || '') : ''} ${typeof alumno.persona === 'object' ? (alumno.persona?.apellidos || '') : ''}</strong></span>
                  <span style="color: #666;">${typeof alumno.persona === 'object' ? (alumno.persona?.email || 'N/A') : 'N/A'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Información del reporte -->
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
          <h4 style="color: #721c24; margin: 0 0 10px 0; font-size: 14px;">📄 Información del Reporte</h4>
          <div style="font-size: 12px; color: #721c24;">
            <p style="margin: 5px 0;"><strong>Tipo de reporte:</strong> Perfil de Usuario Individual</p>
            <p style="margin: 5px 0;"><strong>Usuario:</strong> ${this.currentPersona.nombres} ${this.currentPersona.apellidos}</p>
            <p style="margin: 5px 0;"><strong>Rol específico:</strong> ${this.getSpecificRoleInfo()}</p>
            <p style="margin: 5px 0;"><strong>Propósito:</strong> Documento oficial de información personal y del sistema</p>
            <p style="margin: 5px 0;"><strong>Generado por:</strong> Sistema de Gestión Club 9 de Julio</p>
          </div>
        </div>
        
        <!-- Footer con información de contacto -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #28a745; color: #666; font-size: 11px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 10px;">
            <div>
              <strong style="color: #28a745;">📍 Dirección</strong><br>
              CALLE Africa s/n Barrio 9 de julio<br>
              Palpalá, Argentina
            </div>
            <div>
              <strong style="color: #28a745;">📞 Contacto</strong><br>
              Tel: 0388 15-472-6885<br>
              Email: info@club9dejulio.com
            </div>
            <div>
              <strong style="color: #28a745;">🌐 Web</strong><br>
              www.club9dejulio.com<br>
              @club9dejulio
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="margin: 0; font-style: italic;">"Formando campeones dentro y fuera del campo" - Club 9 de Julio</p>
        </div>
      </div>
    `;

    document.body.appendChild(elementoTemporal);

    const opciones = {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 900,
      height: elementoTemporal.scrollHeight
    };

    html2canvas(elementoTemporal, opciones).then(canvas => {
      document.body.removeChild(elementoTemporal);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 280;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nombreArchivo = `perfil-${this.currentPersona?.nombres}-${this.currentPersona?.apellidos}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nombreArchivo);

      this.notificationService.showSuccess('Éxito', 'Perfil exportado a PDF correctamente');
    }).catch(error => {
      document.body.removeChild(elementoTemporal);
      console.error('Error al generar PDF:', error);
      this.notificationService.showError('Error', 'No se pudo generar el PDF del perfil');
    });
  }
}
