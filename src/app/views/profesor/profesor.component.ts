import { Component, OnInit } from '@angular/core';
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
  RowDirective,
  TableDirective
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
    TableDirective,
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
  profesores: any[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  editingId: string | null = null;
  
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
  
  constructor(private profesorService: ProfesorService) {}

  ngOnInit() {
    this.getProfesores();
  }

  getProfesores() {
    this.profesorService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data;
        console.log('profesores', this.profesores);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los profesores';
        console.error('Error:', error);
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
        this.profesores.push(response.data);
        this.successMessage = 'Profesor creado exitosamente';
        this.onReset();
        this.isSubmitting = false;
        this.getProfesores();
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
        this.profesores = this.profesores.map((p: any) => p._id === id ? response.data : p);
        this.successMessage = 'Profesor actualizado exitosamente';
        this.onReset();
        this.isSubmitting = false;
        this.isEditing = false;
        this.editingId = null;
        this.getProfesores();
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
          this.profesores = this.profesores.filter((p: any) => p._id !== id);
          this.successMessage = 'Profesor eliminado exitosamente';
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el profesor';
          console.error('Error:', error);
        }
      });
    }
  }

  getProfesor(profesor: any) {
    this.isEditing = true;
    this.editingId = profesor._id;
    console.log('profesor que llega al getProfesor ', profesor);
    
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
  }

  editProfesor(id: string, profesor: any) {
    this.profesorService.updateProfesor(id, profesor).subscribe({
      next: (response: any) => {
        this.profesores = this.profesores.map((p: any) => p._id === id ? response.data : p);
        this.successMessage = 'Profesor actualizado exitosamente';
        this.onReset();
        this.isSubmitting = false;
        this.isEditing = false;
        this.editingId = null;
        this.getProfesores();
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar el profesor';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.onReset();
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
}
