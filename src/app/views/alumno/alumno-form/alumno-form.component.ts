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
  ModalComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent
} from '@coreui/angular';

// Models and Services
import { Alumno, AlumnoModel, ESTADOS_ALUMNO } from '../../../models/alumno.model';
import { Persona, PersonaModel, TIPOS_DOCUMENTO, GENEROS } from '../../../models/persona.model';
import { Categoria } from '../../../models/categoria';
import { User, UserModel } from '../../../models/user.model';
import { EstadoAlumnoCategoria } from '../../../models/alumno-categoria.model';
import { AlumnoService } from '../../../services/alumno.service';
import { PersonaService } from '../../../services/persona.service';
import { CategoriaService } from '../../../services/categoria.service';
import { UserService } from '../../../services/user.service';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { NotificationService } from '../../../services/notification.service';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-alumno-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    SpinnerComponent,
    FormControlDirective,
    FormSelectDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    //AlertComponent,
    RowComponent,
    ColComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    IconDirective 
  ],
  templateUrl: './alumno-form.component.html',
  styleUrl: './alumno-form.component.scss'
})
export class AlumnoFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  alumnoForm: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;
  isEditMode = false;
  alumnoId: string | null = null;
  
  // Opciones para selects
  tiposDocumento = TIPOS_DOCUMENTO;
  generos = GENEROS;
  estadosAlumno = ESTADOS_ALUMNO;
  
  // Datos para dropdowns
  tutores: UserModel[] = [];
  categorias: Categoria[] = [];
  categoriasCompatibles: Categoria[] = [];

  // Modal para nuevo tutor
  showTutorModal = false;
  tutorForm: FormGroup;
  creatingTutor = false;

  viveEnOtroDomicilio = false;

  // Agregar variables para mostrar email y teléfono del tutor
  public tutorEmail: string = '';
  public tutorTelefono: string = '';

  // Variable para guardar la categoría original en modo edición
  private categoriaOriginal: string | null = null;
  originalFormValue: any = null;

  constructor(
    private fb: FormBuilder,
    private alumnoService: AlumnoService,
    private personaService: PersonaService,
    private categoriaService: CategoriaService,
    private userService: UserService,
    private alumnoCategoriaService: AlumnoCategoriaService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.alumnoForm = this.createForm();
    this.tutorForm = this.createTutorForm();
  }

  ngOnInit(): void {
    // Cargar datos para dropdowns
    this.loadTutores();
    this.loadCategorias();
    
    // Listener para actualizar email ficticio si cambia el DNI
    this.alumnoForm.get('persona.numeroDocumento')?.valueChanges.subscribe(dni => {
      const emailCtrl = this.alumnoForm.get('persona.email');
      if (emailCtrl && emailCtrl.value && emailCtrl.value.includes('@sinmail.com')) {
        const nuevoEmail = `alumno-${dni || 'sin-dni'}@sinmail.com`;
        emailCtrl.enable({ emitEvent: false });
        emailCtrl.setValue(nuevoEmail, { emitEvent: false });
        emailCtrl.disable({ emitEvent: false });
      }
    });

    // Verificar si estamos en modo edición
    this.alumnoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.alumnoId;
    
    if (this.isEditMode && this.alumnoId) {
      this.loadAlumno(this.alumnoId);
    } else {
      // En modo creación, inicializar la categoría original como null
      this.categoriaOriginal = null;
    }

    this.alumnoForm.valueChanges.subscribe(() => {
      console.log('alumnoForm valores:', this.alumnoForm.value);
      console.log('alumnoForm válido:', this.alumnoForm.valid);
      console.log('alumnoForm errores:', this.alumnoForm.errors);
      this.logFormErrors(this.alumnoForm);
    });

    this.alumnoForm.get('tutor')?.valueChanges.subscribe(tutorId => {
      console.log('Tutor seleccionado:', tutorId);
      if (!this.viveEnOtroDomicilio && tutorId) {
        const tutor = this.tutores.find(t => t._id === tutorId);
        console.log('Tutor encontrado:', tutor);
        if (tutor) {
          if (tutor.persona && typeof tutor.persona === 'object' && (tutor.persona as any).direccion) {
            const persona = tutor.persona as any;
            console.log('Seteando dirección desde objeto:', persona.direccion);
            this.setDireccionAlumno(persona.direccion);
            this.setContactoAlumno({ email: persona.email || '', telefono: persona.telefono || '' });
            this.tutorEmail = persona.email || '';
            this.tutorTelefono = persona.telefono || '';
          } else if (tutor.persona && typeof tutor.persona === 'string') {
            this.personaService.getPersonaById(tutor.persona).subscribe({
              next: (personaResp) => {
                console.log('Persona recibida:', personaResp);
                if (personaResp.success && personaResp.data && personaResp.data.direccion) {
                  this.setDireccionAlumno(personaResp.data.direccion);
                  this.setContactoAlumno({ email: personaResp.data.email || '', telefono: personaResp.data.telefono || '' });
                  this.tutorEmail = personaResp.data.email || '';
                  this.tutorTelefono = personaResp.data.telefono || '';
                }
              }
            });
            return;
          }
        }
      } else {
        // Si se deselecciona el tutor o se marca "vive en otro domicilio", limpiar los campos
        this.tutorEmail = '';
        this.tutorTelefono = '';
        this.setContactoAlumno({ email: '', telefono: '' });
      }
    });

    // LOGS EN TIEMPO REAL DEL FORMULARIO DE TUTOR
    this.tutorForm.valueChanges.subscribe(() => {
      console.log('TutorForm válido:', this.tutorForm.valid);
      console.log('TutorForm errores:', this.tutorForm.errors);
      console.log('TutorForm valores:', this.tutorForm.value);
      this.logFormErrors(this.tutorForm);
    });
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
      // Datos de persona
      persona: this.fb.group({
        _id: [''],
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
        genero: ['MASCULINO', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required]],
        direccion: this.fb.group({
          calle: [''],
          ciudad: [''],
          departamento: [''],
          codigoPostal: [''],
          pais: ['']
        })
      }),
      
      // Datos de alumno
      tutor: ['', [Validators.required]],
      categoriaPrincipal: ['', [Validators.required]],
      numero_socio: ['', [Validators.required]],
      observaciones_medicas: [''],
      contacto_emergencia: ['', [Validators.required]],
      telefono_emergencia: ['', [Validators.required]],
      autoriza_fotos: [false, [Validators.required]],
      estado: ['ACTIVO', [Validators.required]]
    });
  }

  /**
   * Crear formulario para nuevo tutor
   */
  private createTutorForm(): FormGroup {
    return this.fb.group({
      // Datos de usuario
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [Validators.required]],
      rol: ['TUTOR', [Validators.required]],
      estado: ['ACTIVO', [Validators.required]],
      
      // Datos de persona
      persona: this.fb.group({
        nombres: ['', [
          Validators.required,
          Validators.minLength(2)
        ]],
        apellidos: ['', [
          Validators.required,
          Validators.minLength(2)
        ]],
        tipoDocumento: ['DNI', [Validators.required]],
        numeroDocumento: ['', [
          Validators.required,
          Validators.pattern('^[0-9]{7,8}$')
        ]],
        fechaNacimiento: ['', [Validators.required]],
        genero: ['MASCULINO', [Validators.required]],
        telefono: [''],
        email: ['', [
          Validators.required,
          Validators.email
        ]],
        
        // Dirección (calle y ciudad obligatorios)
        direccion: this.fb.group({
          calle: ['', [Validators.required, Validators.minLength(2)]],
          ciudad: ['', [Validators.required, Validators.minLength(2)]],
          departamento: ['', [Validators.required, Validators.minLength(1)]],
          codigoPostal: ['', [Validators.required, Validators.minLength(1)]],
          pais: ['', [Validators.required, Validators.minLength(2)]]
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
    
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Cargar tutores para el dropdown
   */
  private loadTutores(): void {
    this.userService.getUsersByRole('TUTOR', 1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tutores = (response.data.users || []).map((user: any) => UserModel.fromJSON(user));
        }
      },
      error: (error) => {
        console.error('Error al cargar tutores:', error);
      }
    });
  }

  /**
   * Cargar categorías para el dropdown
   */
  private loadCategorias(): void {
    this.categoriaService.getCategoriasActivas().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.updateCategoriasCompatibles();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  /**
   * Actualizar categorías compatibles según la edad
   */
  private updateCategoriasCompatibles(): void {
    const fechaNacimiento = this.alumnoForm.get('persona.fechaNacimiento')?.value;
    if (fechaNacimiento) {
      const edad = this.calcularEdad(fechaNacimiento);
      this.categoriasCompatibles = this.categorias.filter(cat => 
        cat.edadMinima <= edad && 
        cat.edadMaxima >= edad && 
        cat.estado === 'ACTIVA' &&
        (cat.alumnosActuales || 0) < cat.cupoMaximo
      );
    } else {
      this.categoriasCompatibles = this.categorias.filter(cat => 
        cat.estado === 'ACTIVA' &&
        (cat.alumnosActuales || 0) < cat.cupoMaximo
      );
    }
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  private calcularEdad(fechaNacimiento: string): number {
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Manejar cambio en fecha de nacimiento
   */
  onFechaNacimientoChange(): void {
    this.updateCategoriasCompatibles();
    
    // Limpiar categoría seleccionada si no es compatible
    const categoriaSeleccionada = this.alumnoForm.get('categoriaPrincipal')?.value;
    if (categoriaSeleccionada) {
      const esCompatible = this.categoriasCompatibles.some(cat => cat._id === categoriaSeleccionada);
      if (!esCompatible) {
        this.alumnoForm.get('categoriaPrincipal')?.setValue('');
      }
    }
  }

  /**
   * Abrir modal para crear nuevo tutor
   */
  openTutorModal(): void {
    this.showTutorModal = true;
    this.tutorForm.reset({
      rol: 'TUTOR',
      estado: 'ACTIVO',
      persona: {
        tipoDocumento: 'DNI',
        genero: 'MASCULINO'
      }
    });
  }

  /**
   * Cerrar modal de tutor
   */
  closeTutorModal(): void {
    this.showTutorModal = false;
    this.tutorForm.reset();
  }

  /**
   * Crear nuevo tutor
   */
  createTutor(): void {
    console.log('Estado del formulario tutor:', this.tutorForm.valid);
    console.log('Errores del formulario:', this.tutorForm.errors);
    console.log('Valores del formulario:', this.tutorForm.value);
    
    if (this.tutorForm.invalid) {
      this.markFormGroupTouched(this.tutorForm);
      this.logFormErrors(this.tutorForm);
      return;
    }

    this.creatingTutor = true;
    const formData = { ...this.tutorForm.value };
    // Normalizar dirección y campos opcionales
    const personaData = { ...formData.persona };
    if (personaData.direccion) {
      Object.keys(personaData.direccion).forEach(key => {
        if (personaData.direccion[key] == null) {
          personaData.direccion[key] = '';
        }
      });
    }
    if (personaData.telefono == null) personaData.telefono = '';
    if (personaData.email == null) personaData.email = '';
    if (personaData.fechaNacimiento) {
      personaData.fechaNacimiento = new Date(personaData.fechaNacimiento).toISOString().split('T')[0];
    }

    // Crear persona primero
    this.personaService.createPersona(personaData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (personaResponse) => {
          if (personaResponse.success && personaResponse.data) {
            // Crear usuario con rol TUTOR
            const userData = {
              persona: personaResponse.data._id!,
              username: formData.username,
              password: formData.password,
              rol: 'TUTOR'
            };

            this.userService.createUser(userData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    this.notificationService.showSuccess('Tutor creado correctamente');
                    this.closeTutorModal();
                    this.loadTutores(); // Recargar lista de tutores
                    // Seleccionar automáticamente el nuevo tutor
                    setTimeout(() => {
                      if (response && response.data && response.data._id) {
                        const data = response.data;
                        this.alumnoForm.get('tutor')?.setValue(data._id);
                        // Obtener la persona completa y setear la dirección
                        if (userData.persona) {
                          this.personaService.getPersonaById(userData.persona).subscribe({
                            next: (personaResp) => {
                              if (personaResp.success && personaResp.data && personaResp.data.direccion) {
                                this.setDireccionAlumno(personaResp.data.direccion);
                                this.setContactoAlumno({
                                  email: personaResp.data.email || '',
                                  telefono: personaResp.data.telefono || ''
                                });
                                this.tutorEmail = personaResp.data.email || '';
                                this.tutorTelefono = personaResp.data.telefono || '';
                              }
                            }
                          });
                        }
                      }  
                    }, 100);
                  }
                  this.creatingTutor = false;
                },
                error: (error) => {
                  this.error = 'Error al crear el tutor: ' + (error.error?.message || error.message);
                  this.notificationService.showError('Error al crear tutor');
                  this.creatingTutor = false;
                }
              });
          }
        },
        error: (error) => {
          this.error = 'Error al crear la persona del tutor: ' + (error.error?.message || error.message);
          this.notificationService.showError('Error al crear persona del tutor');
          this.creatingTutor = false;
        }
      });
  }

  /**
   * Cargar datos del alumno para edición
   */
  private loadAlumno(alumnoId: string): void {
    this.loading = true;
    this.error = null;

    this.alumnoService.getAlumno(alumnoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.populateForm(response.data);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar el alumno: ' + (error.error?.message || error.message);
          this.loading = false;
        }
      });
  }

  /**
   * Poblar el formulario con datos del alumno
   */
  private populateForm(alumno: Alumno): void {
    const persona = (typeof alumno.persona_datos === 'object' && alumno.persona_datos !== null)
      ? alumno.persona_datos
      : (typeof alumno.persona === 'object' && alumno.persona !== null)
        ? alumno.persona
        : null;
    this.alumnoForm.patchValue({
      persona: {
        _id: persona?._id || '',
        nombres: persona?.nombres || '',
        apellidos: persona?.apellidos || '',
        tipoDocumento: persona?.tipoDocumento || 'DNI',
        numeroDocumento: persona?.numeroDocumento || '',
        fechaNacimiento: persona?.fechaNacimiento ? 
          new Date(persona.fechaNacimiento).toISOString().split('T')[0] : '',
        genero: persona?.genero || 'MASCULINO',
        email: persona?.email || '',
        telefono: persona?.telefono || '',
        direccion: {
          calle: persona?.direccion?.calle || '',
          ciudad: persona?.direccion?.ciudad || '',
          departamento: persona?.direccion?.departamento || '',
          codigoPostal: persona?.direccion?.codigoPostal || '',
          pais: persona?.direccion?.pais || ''
        }
      },
      tutor: (typeof alumno.tutor === 'object' && alumno.tutor !== null) ? alumno.tutor._id : alumno.tutor,
      categoriaPrincipal: (typeof alumno.categoriaPrincipal === 'object' && alumno.categoriaPrincipal !== null) ? alumno.categoriaPrincipal._id : alumno.categoriaPrincipal,
      numero_socio: alumno.numero_socio,
      observaciones_medicas: alumno.observaciones_medicas || '',
      contacto_emergencia: alumno.contacto_emergencia,
      telefono_emergencia: alumno.telefono_emergencia,
      autoriza_fotos: alumno.autoriza_fotos,
      estado: alumno.estado || 'ACTIVO'
    });
    // Guardar copia profunda del valor original para comparación
    this.originalFormValue = JSON.parse(JSON.stringify(this.alumnoForm.getRawValue()));
    this.updateCategoriasCompatibles();
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    // Habilitar temporalmente los campos de contacto
    const emailCtrl = this.alumnoForm.get('persona.email');
    const telCtrl = this.alumnoForm.get('persona.telefono');
    if (emailCtrl) emailCtrl.enable({ emitEvent: false });
    if (telCtrl) telCtrl.enable({ emitEvent: false });

    // Usar getRawValue para obtener todos los valores, incluidos los deshabilitados
    const formData = this.alumnoForm.getRawValue();

    // 1. Bloquear guardado si no hay cambios
    if (this.isEditMode && this.originalFormValue && JSON.stringify(formData) === JSON.stringify(this.originalFormValue)) {
      this.notificationService.showWarning('No se detectaron cambios para guardar.');
      // Volver a deshabilitar si corresponde
      if (!this.viveEnOtroDomicilio) {
        if (emailCtrl) emailCtrl.disable({ emitEvent: false });
        if (telCtrl) telCtrl.disable({ emitEvent: false });
      }
      return;
    }

    // 2. Advertencia si se cambia el número de socio
    if (this.isEditMode && this.originalFormValue) {
      const originalSocio = this.originalFormValue.numero_socio;
      if (formData.numero_socio !== originalSocio) {
        const confirmMsg = 'Estás a punto de cambiar un dato sensible (número de socio). ¿Deseas continuar?';
        if (!window.confirm(confirmMsg)) {
          // Volver a deshabilitar si corresponde
          if (!this.viveEnOtroDomicilio) {
            if (emailCtrl) emailCtrl.disable({ emitEvent: false });
            if (telCtrl) telCtrl.disable({ emitEvent: false });
          }
          return;
        }
      }
    }

    if (this.alumnoForm.invalid) {
      this.logFormErrors(this.alumnoForm);
      this.markFormGroupTouched(this.alumnoForm);
      // Volver a deshabilitar si corresponde
      if (!this.viveEnOtroDomicilio) {
        if (emailCtrl) emailCtrl.disable({ emitEvent: false });
        if (telCtrl) telCtrl.disable({ emitEvent: false });
      }
      return;
    }

    this.submitting = true;
    this.error = null;

    if (this.isEditMode && this.alumnoId) {
      this.updateAlumno(this.alumnoId, formData);
    } else {
      this.createAlumno(formData);
    }

    // Si corresponde, volver a deshabilitarlos
    if (!this.viveEnOtroDomicilio) {
      if (emailCtrl) emailCtrl.disable({ emitEvent: false });
      if (telCtrl) telCtrl.disable({ emitEvent: false });
    }
  }

  /**
   * Crear alumno
   */
  private createAlumno(formData: any): void {
    // Usar SIEMPRE el valor actual del formulario para el DNI
    const formValue = this.alumnoForm.value;
    const dni = formValue.persona.numeroDocumento;

    // Generar el payload de persona con el email ficticio actualizado
    const personaPayload = {
      ...formValue.persona,
      email: `alumno-${dni}@sinmail.com`
    };

    // Eliminar _id vacío antes de enviar al backend
    if (personaPayload._id === '' || personaPayload._id === undefined) {
      delete personaPayload._id;
    }

    // Generar el payload completo de alumno
    const alumnoPayload = {
      ...formValue,
      persona: personaPayload
    };

    // Logs de verificación
    console.log('DNI actual:', dni);
    console.log('Email generado:', personaPayload.email);
    console.log('Payload completo:', alumnoPayload);

    // Crear la persona y el alumno
    this.personaService.createPersona(personaPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (personaResponse) => {
          if (personaResponse.success && personaResponse.data) {
            // Crear el alumno con la referencia a la persona
            const alumnoData = {
              ...alumnoPayload,
              persona: personaResponse.data._id!,
              fecha_inscripcion: new Date().toISOString()
            };

            this.alumnoService.createAlumno(alumnoData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    // Crear automáticamente el registro en alumno-categoria
                    const alumnoCategoriaData = {
                      alumno: response.data._id,
                      categoria: formValue.categoriaPrincipal,
                      fecha_inscripcion: new Date().toISOString(),
                      estado: 'ACTIVO' as EstadoAlumnoCategoria
                    };

                    this.alumnoCategoriaService.addAlumnoCategoria(alumnoCategoriaData)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe({
                        next: (alumnoCategoriaResponse) => {
                          if (alumnoCategoriaResponse.success) {
                            this.notificationService.showSuccess('Alumno creado correctamente y asignado a la categoría');
                          } else {
                            this.notificationService.showWarning('Alumno creado pero hubo un problema al asignarlo a la categoría');
                          }
                          this.router.navigate(['/alumno/lista']);
                          this.submitting = false;
                        },
                        error: (alumnoCategoriaError) => {
                          console.error('Error al crear relación alumno-categoria:', alumnoCategoriaError);
                          this.notificationService.showWarning('Alumno creado pero hubo un problema al asignarlo a la categoría');
                          this.router.navigate(['/alumno/lista']);
                          this.submitting = false;
                        }
                      });
                  } else {
                    this.submitting = false;
                  }
                },
                error: (error) => {
                  this.error = error.error?.message || error.message || 'Error al crear el alumno';
                  this.notificationService.showError(this.error || 'Ocurrió un error inesperado');
                  this.submitting = false;
                  
                  // Mensaje más claro para el usuario
                  const mensajeUsuario = `${this.error}\n\nPuedes corregir los errores y volver a intentar. Los datos del formulario se mantienen.`;
                  alert(mensajeUsuario);
                  
                  // Log para verificar que los datos se mantienen
                  console.log('=== DESPUÉS DEL ERROR DE ALUMNO ===');
                  console.log('Datos del formulario después del error:', this.alumnoForm.value);
                  console.log('Formulario válido:', this.alumnoForm.valid);
                  console.log('==========================');
                }
              });
          }
        },
        error: (error) => {
          this.error = error.error?.message || error.message || 'Error al crear la persona';
          this.notificationService.showError(this.error || 'Ocurrió un error inesperado');
          this.submitting = false;
          
          // Mensaje más claro para el usuario
          const mensajeUsuario = `${this.error}\n\nPuedes corregir los errores y volver a intentar. Los datos del formulario se mantienen.`;
          alert(mensajeUsuario);
          
          // Log para verificar que los datos se mantienen
          console.log('=== DESPUÉS DEL ERROR ===');
          console.log('Datos del formulario después del error:', this.alumnoForm.value);
          console.log('Formulario válido:', this.alumnoForm.valid);
          console.log('==========================');
        }
      });
  }

  /**
   * Actualizar alumno
   */
  private updateAlumno(alumnoId: string, formData: any): void {
    // 1. Actualizar persona primero
    const personaId = this.alumnoForm.get('persona')?.value?._id || this.alumnoForm.get('persona')?.value?.id;
    const personaPayload = { ...formData.persona };
    if (personaId) {
      this.personaService.updatePersona(personaId, personaPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (personaResp) => {
            // 2. Actualizar el alumno con el resto de los datos
            const updateData = {
              tutor: formData.tutor,
              categoriaPrincipal: formData.categoriaPrincipal,
              numero_socio: formData.numero_socio,
              observaciones_medicas: formData.observaciones_medicas,
              contacto_emergencia: formData.contacto_emergencia,
              telefono_emergencia: formData.telefono_emergencia,
              autoriza_fotos: formData.autoriza_fotos,
              estado: formData.estado
            };
            this.alumnoService.updateAlumno(alumnoId, updateData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    // Si se cambió la categoría principal, actualizar la relación alumno-categoria
                    if (formData.categoriaPrincipal && formData.categoriaPrincipal !== this.categoriaOriginal) {
                      this.updateAlumnoCategoriaRelation(alumnoId, formData.categoriaPrincipal);
                    } else {
                      this.notificationService.showSuccess('Alumno actualizado correctamente');
                      this.router.navigate(['/alumno/lista']);
                    }
                  }
                  this.submitting = false;
                },
                error: (error) => {
                  this.error = 'Error al actualizar el alumno: ' + (error.error?.message || error.message);
                  this.notificationService.showError('Error al actualizar alumno');
                  this.submitting = false;
                }
              });
          },
          error: (error) => {
            this.error = 'Error al actualizar la persona: ' + (error.error?.message || error.message);
            this.notificationService.showError('Error al actualizar persona');
            this.submitting = false;
          }
        });
    } else {
      // Si no hay personaId, solo actualizar el alumno (caso raro)
      const updateData = {
        tutor: formData.tutor,
        categoriaPrincipal: formData.categoriaPrincipal,
        numero_socio: formData.numero_socio,
        observaciones_medicas: formData.observaciones_medicas,
        contacto_emergencia: formData.contacto_emergencia,
        telefono_emergencia: formData.telefono_emergencia,
        autoriza_fotos: formData.autoriza_fotos,
        estado: formData.estado
      };
      this.alumnoService.updateAlumno(alumnoId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              if (formData.categoriaPrincipal && formData.categoriaPrincipal !== this.categoriaOriginal) {
                this.updateAlumnoCategoriaRelation(alumnoId, formData.categoriaPrincipal);
              } else {
                this.notificationService.showSuccess('Alumno actualizado correctamente');
                this.router.navigate(['/alumno/lista']);
              }
            }
            this.submitting = false;
          },
          error: (error) => {
            this.error = 'Error al actualizar el alumno: ' + (error.error?.message || error.message);
            this.notificationService.showError('Error al actualizar alumno');
            this.submitting = false;
          }
        });
    }
  }

  /**
   * Actualizar la relación alumno-categoria
   */
  private updateAlumnoCategoriaRelation(alumnoId: string, nuevaCategoriaId: string): void {
    // Primero buscar si ya existe una relación con esta categoría específica
    this.alumnoCategoriaService.getCategoriasPorAlumno(alumnoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.length > 0) {
            // Verificar si ya existe una relación con esta categoría
            const relacionExistente = response.data.find((rel: any) => 
              rel.categoria === nuevaCategoriaId || 
              (typeof rel.categoria === 'object' && rel.categoria._id === nuevaCategoriaId)
            );
            
            if (relacionExistente) {
              // Si ya existe la relación, solo actualizar el alumno (no crear duplicado)
              this.notificationService.showSuccess('Alumno actualizado correctamente. Ya estaba inscrito en esta categoría.');
              this.router.navigate(['/alumno/lista']);
            } else {
              // Si no existe la relación, crear una nueva (respetando muchos a muchos)
              this.createNewAlumnoCategoriaRelation(alumnoId, nuevaCategoriaId);
            }
          } else {
            // No hay relaciones existentes, crear nueva
            this.createNewAlumnoCategoriaRelation(alumnoId, nuevaCategoriaId);
          }
        },
        error: (error) => {
          console.error('Error al obtener relaciones alumno-categoria:', error);
          this.notificationService.showWarning('Alumno actualizado pero hubo un problema al verificar las categorías');
          this.router.navigate(['/alumno/lista']);
        }
      });
  }

  /**
   * Crear nueva relación alumno-categoria
   */
  private createNewAlumnoCategoriaRelation(alumnoId: string, categoriaId: string): void {
    const alumnoCategoriaData = {
      alumno: alumnoId,
      categoria: categoriaId,
      fecha_inscripcion: new Date().toISOString(),
      estado: 'ACTIVO' as EstadoAlumnoCategoria
    };

    this.alumnoCategoriaService.addAlumnoCategoria(alumnoCategoriaData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Alumno actualizado e inscrito en nueva categoría correctamente');
          } else {
            this.notificationService.showWarning('Alumno actualizado pero hubo un problema al inscribirlo en la categoría');
          }
          this.router.navigate(['/alumno/lista']);
        },
        error: (error) => {
          console.error('Error al crear relación alumno-categoria:', error);
          this.notificationService.showWarning('Alumno actualizado pero hubo un problema al asignarlo a la categoría');
          this.router.navigate(['/alumno/lista']);
        }
      });
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control && typeof control.value === 'object' && control.value !== null) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  /**
   * Log de errores del formulario para debugging
   */
  private logFormErrors(formGroup: FormGroup, path: string = ''): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      const currentPath = path ? `${path}.${key}` : key;
      
      if (control?.errors) {
        console.log(`Error en ${currentPath}:`, control.errors);
      }
      
      if (control && control instanceof FormGroup) {
        this.logFormErrors(control, currentPath);
      }
    });
  }

  /**
   * Cancelar y volver a la lista
   */
  onCancel(): void {
    this.router.navigate(['/alumno/lista']);
  }

  /**
   * Ir a la lista de alumnos
   */
  onVerLista(): void {
    this.router.navigate(['/alumno/lista']);
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(fieldPath: string): boolean {
    const field = this.alumnoForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Verificar si un campo del formulario de tutor tiene error
   */
  hasTutorError(fieldPath: string): boolean {
    const field = this.tutorForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getErrorMessage(fieldPath: string): string {
    const field = this.alumnoForm.get(fieldPath);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) {
      if (fieldPath === 'numero_socio') return 'Solo letras, números y guión bajo';
      if (fieldPath.includes('numeroDocumento')) return 'Debe contener 7 u 8 dígitos numéricos';
      if (fieldPath.includes('telefono')) return 'Ingrese un número de teléfono válido';
    }
    
    return 'Campo inválido';
  }

  /**
   * Obtener mensaje de error de un campo del formulario de tutor
   */
  getTutorErrorMessage(fieldPath: string): string {
    const field = this.tutorForm.get(fieldPath);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['pattern']) {
      if (fieldPath === 'username') return 'Solo letras, números y guión bajo';
      if (fieldPath.includes('numeroDocumento')) return 'Debe contener 7 u 8 dígitos numéricos';
      if (fieldPath.includes('telefono')) return 'Ingrese un número de teléfono válido';
    }
    
    return 'Campo inválido';
  }

  /**
   * Verificar si las contraseñas del tutor coinciden
   */
  get tutorPasswordMismatch(): boolean {
    return !!(this.tutorForm.hasError('passwordMismatch') && 
           (this.tutorForm.get('confirmPassword')?.dirty || this.tutorForm.get('confirmPassword')?.touched));
  }

  /**
   * Obtener título del formulario
   */
  get formTitle(): string {
    return this.isEditMode ? 'Editar Alumno' : 'Crear Nuevo Alumno';
  }

  /**
   * Obtener texto del botón de envío
   */
  get submitButtonText(): string {
    if (this.submitting) {
      return this.isEditMode ? 'Actualizando...' : 'Creando...';
    }
    return this.isEditMode ? 'Actualizar Alumno' : 'Crear Alumno';
  }

  setDireccionAlumno(direccion: any) {
    console.log('Seteando dirección en alumno:', direccion);
    // Habilitar los campos antes de setear el valor
    const controls = [
      'persona.direccion.calle',
      'persona.direccion.ciudad',
      'persona.direccion.departamento',
      'persona.direccion.codigoPostal',
      'persona.direccion.pais'
    ];
    controls.forEach(ctrl => {
      const control = this.alumnoForm.get(ctrl);
      if (control) control.enable({ emitEvent: false });
    });

    this.alumnoForm.get('persona.direccion.calle')?.setValue(direccion.calle || '');
    this.alumnoForm.get('persona.direccion.ciudad')?.setValue(direccion.ciudad || '');
    this.alumnoForm.get('persona.direccion.departamento')?.setValue(direccion.departamento || '');
    this.alumnoForm.get('persona.direccion.codigoPostal')?.setValue(direccion.codigoPostal || '');
    this.alumnoForm.get('persona.direccion.pais')?.setValue(direccion.pais || '');

    // Volver a deshabilitar si corresponde
    if (!this.viveEnOtroDomicilio) {
      controls.forEach(ctrl => {
        const control = this.alumnoForm.get(ctrl);
        if (control) control.disable({ emitEvent: false });
      });
    }

    this.toggleDireccionAlumnoCampos();
  }

  setContactoAlumno(contacto: { email: string, telefono: string }) {
    const emailCtrl = this.alumnoForm.get('persona.email');
    const telCtrl = this.alumnoForm.get('persona.telefono');
    const numeroDocumento = this.alumnoForm.get('persona.numeroDocumento')?.value;
    let emailFinal = contacto.email || '';

    // Si el email del tutor es igual al del alumno (o ya existe en el form), generar uno ficticio
    if (emailCtrl && emailFinal) {
      // Si el email ya está seteado y es igual al del tutor, o si el email ya existe en otra persona, usar uno ficticio
      // (En este contexto, simplemente lo generamos siempre que el tutor y el alumno sean distintos)
      const tutorId = this.alumnoForm.get('tutor')?.value;
      // Si el alumno y el tutor tienen el mismo email, generamos uno ficticio
      if (emailCtrl.value === emailFinal || tutorId) {
        emailFinal = `alumno-${numeroDocumento || 'sin-dni'}@sinmail.com`;
      }
    }

    if (emailCtrl) {
      emailCtrl.enable({ emitEvent: false });
      emailCtrl.setValue(emailFinal, { emitEvent: false });
    }
    if (telCtrl) {
      telCtrl.enable({ emitEvent: false });
      telCtrl.setValue(contacto.telefono || '', { emitEvent: false });
    }
    if (!this.viveEnOtroDomicilio) {
      if (emailCtrl) emailCtrl.disable({ emitEvent: false });
      if (telCtrl) telCtrl.disable({ emitEvent: false });
    }
  }

  onViveEnOtroDomicilioChange(event: any) {
    this.viveEnOtroDomicilio = event.target.checked;
    this.toggleDireccionAlumnoCampos();
    if (!this.viveEnOtroDomicilio) {
      // Si se desmarca, autocompletar con la dirección del tutor
      const tutorId = this.alumnoForm.get('tutor')?.value;
      const tutor = this.tutores.find(t => t._id === tutorId);
      if (tutor && tutor.persona && typeof tutor.persona === 'object' && tutor.persona.direccion) {
        this.setDireccionAlumno(tutor.persona.direccion);
      }
    }
  }

  toggleDireccionAlumnoCampos() {
    const controls = [
      'persona.direccion.calle',
      'persona.direccion.ciudad',
      'persona.direccion.departamento',
      'persona.direccion.codigoPostal',
      'persona.direccion.pais'
    ];
    controls.forEach(ctrl => {
      const control = this.alumnoForm.get(ctrl);
      if (control) {
        if (this.viveEnOtroDomicilio) {
          control.enable();
        } else {
          control.disable();
        }
      }
    });
  }
}