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
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  RowDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor } from '@angular/common';
  
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
    FormFeedbackComponent,
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
 
  profesorFormValidated = false;
  profesor = {
    personaData: {
      _id: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      tipoDocumento: '',
      numeroDocumento: '',
      fechaNacimiento: '',
      genero: '',
      email: '',
      direccion: {
        calle: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        pais: ''
      }
    },
    titulo: '',
    experiencia_anios: 0,
    fecha_contratacion: '',
    salario: 0,
    activo_laboral: false,
    _id: ''
  };
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  editingId: string | null = null;
  emailValidating = false;
  emailValid = true;
  
  // Opciones para los selects
  tiposDocumento = [
    { value: 'DNI', label: 'DNI' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'CARNET_EXTRANJERIA', label: 'Carnet de extranjería' }
  ];

  generos = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMENINO', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro' },
    { value: 'PREFIERE_NO_DECIR', label: 'Prefiere no decir' }
  ];

  paises = [
    { value: 'ARGENTINA', label: 'Argentina' },
    { value: 'CHILE', label: 'Chile' },
    { value: 'URUGUAY', label: 'Uruguay' },
    { value: 'PARAGUAY', label: 'Paraguay' },
    { value: 'BRASIL', label: 'Brasil' },
    { value: 'BOLIVIA', label: 'Bolivia' },
    { value: 'PERU', label: 'Perú' },
    { value: 'ECUADOR', label: 'Ecuador' },
    { value: 'COLOMBIA', label: 'Colombia' },
    { value: 'VENEZUELA', label: 'Venezuela' },
    { value: 'OTRO', label: 'Otro' }
  ];
  
  constructor(
    private profesorService: ProfesorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar si hay datos de navegación para editar un profesor
    const state = history.state;
    console.log('Estado de navegación:', state);
    
    if (state && state.profesor && state.isEditing) {
      console.log('Cargando profesor para editar desde state:', state.profesor);
      this.loadProfesorForEdit(state.profesor);
    } else {
      // Verificar si hay parámetros de ruta para editar
      this.route.queryParams.subscribe(params => {
        console.log('Parámetros de ruta:', params);
        if (params['edit'] === 'true' && params['id']) {
          console.log('Cargando profesor desde parámetros de ruta, ID:', params['id']);
          this.loadProfesorById(params['id']);
        } else {
          console.log('No hay datos de profesor para editar');
        }
      });
    }
  }

  loadProfesorForEdit(profesor: any) {
    console.log('Iniciando loadProfesorForEdit con:', profesor);
    this.isEditing = true;
    this.editingId = profesor._id;
    console.log('profesor que llega para editar ', profesor);
    
    // Mapear los datos del backend a la estructura del formulario
    this.profesor = {
      personaData: {
        _id: profesor.persona?._id || '',
        nombres: profesor.persona?.nombres || '',
        apellidos: profesor.persona?.apellidos || '',
        telefono: profesor.persona?.telefono || '',
        tipoDocumento: profesor.persona?.tipoDocumento || '',
        numeroDocumento: profesor.persona?.numeroDocumento || '',
        fechaNacimiento: profesor.persona?.fechaNacimiento ? new Date(profesor.persona.fechaNacimiento).toISOString().split('T')[0] : '',
        genero: profesor.persona?.genero || '',
        email: profesor.persona?.email || '',
        direccion: {
          calle: profesor.persona?.direccion?.calle || '',
          ciudad: profesor.persona?.direccion?.ciudad || '',
          departamento: profesor.persona?.direccion?.departamento || '',
          codigoPostal: profesor.persona?.direccion?.codigoPostal || '',
          pais: profesor.persona?.direccion?.pais || ''
        }
      },
      titulo: profesor.titulo || '',
      experiencia_anios: profesor.experiencia_anios || 0,
      fecha_contratacion: profesor.fecha_contratacion ? new Date(profesor.fecha_contratacion).toISOString().split('T')[0] : '',
      salario: profesor.salario || 0,
      activo_laboral: profesor.activo_laboral || true,
      _id: profesor._id || ''
    };
    console.log('Profesor mapeado:', this.profesor);
  }

  loadProfesorById(id: string) {
    console.log('Cargando profesor por ID:', id);
    this.profesorService.getProfesor(id).subscribe({
      next: (response: any) => {
        console.log('Profesor cargado desde servicio:', response);
        this.loadProfesorForEdit(response.data || response);
      },
      error: (error) => {
        console.error('Error al cargar profesor:', error);
        this.errorMessage = 'Error al cargar los datos del profesor';
      }
    });
  }

  onSubmit() {
    // Marcar el formulario como validado para mostrar errores
    this.profesorFormValidated = true;
    
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (this.isEditing && this.editingId) {
      this.updateProfesor(this.editingId, this.profesor);
    } else {
      this.createProfesor(this.profesor);
    }
  }

  createProfesor(profesor: any) {
    const { _id, personaData, ...profesorSinId } = profesor;
    const { _id: personaId, ...personaDataSinId } = personaData;
    
    const profesorEnviar = {
      ...profesorSinId,
      personaData: personaDataSinId
    };
    
    this.profesorService.createProfesor(profesorEnviar).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profesor creado exitosamente';
        this.onReset();
        this.isSubmitting = false;
        // Navegar a la lista después de crear
        setTimeout(() => {
          this.router.navigate(['/profesor/lista']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = 'Error al crear el profesor';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }
  
  updateProfesor(id: string, profesor: any) {
    console.log('updateProfesor', id, profesor);
  
    console.log('profesorEnviar', profesor);
    this.profesorService.updateProfesor(id, profesor).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profesor actualizado exitosamente';
        this.onReset();
        this.isSubmitting = false;
        this.isEditing = false;
        this.editingId = null;
        // Navegar a la lista después de actualizar
        setTimeout(() => {
          this.router.navigate(['/profesor/lista']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar el profesor';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }
  
  deleteProfesor(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
      this.profesorService.deleteProfesor(id).subscribe({
        next: (response: any) => {
          this.successMessage = 'Profesor eliminado exitosamente';
          // Navegar a la lista después de eliminar
          setTimeout(() => {
            this.router.navigate(['/profesor/lista']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el profesor';
          console.error('Error:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.onReset();
    // Navegar de vuelta a la lista
    this.router.navigate(['/profesor/lista']);
  }

  onReset() {
    this.profesor = {
      personaData: {
        _id: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        tipoDocumento: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        genero: '',
        email: '',
        direccion: {
          calle: '',
          ciudad: '',
          departamento: '',
          codigoPostal: '',
          pais: ''
        }
      },
      titulo: '',
      experiencia_anios: 0,
      fecha_contratacion: '',
      salario: 0,
      activo_laboral: false,
      _id: ''
    };
    this.profesorFormValidated = false;
    this.isEditing = false;
    this.editingId = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  markAsTouched(control: any) {
    if (control && control.control) {
      control.control.markAsTouched();
    }
  }

  // Método para navegar a la lista
  goToList() {
    this.router.navigate(['/profesor/lista']);
  }
}
