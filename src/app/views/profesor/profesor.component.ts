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
 
  profesorFormValidated = false;
  profesor!: ProfesorModel;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  editingId: string | null = null;
  emailValidating = false;
  emailValid = true;
  
  // Opciones para los selects
  tiposDocumento = TIPOS_DOCUMENTO;
  generos = GENEROS;
  
  constructor(
    private profesorService: ProfesorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profesor = new ProfesorModel();
    this.initializeDireccion();
  }

  ngOnInit() {
    // Verificar si hay parámetros de ruta para editar
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true' && params['id']) {
        this.getProfesorById(params['id']);
      } else {
        console.log('No hay datos de profesor para editar');
      }
    });
  }

  mapearProfesorForm(profesor: any) {
    this.isEditing = true;
    this.editingId = profesor._id;
    
    // Mapear los datos del backend a la estructura del formulario
    this.profesor = ProfesorModel.fromJSON(profesor);
  }

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
    this.profesorService.createProfesor(profesor).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profesor creado exitosamente';
        this.isSubmitting = false;
        setTimeout(() => {
          this.onReset();
          this.irALista();
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
    
    this.profesorService.updateProfesor(id, profesor).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profesor actualizado exitosamente';
        this.isSubmitting = false;
        setTimeout(() => {
          this.onReset();
          this.irALista();
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
          setTimeout(() => {
            this.irALista();
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
    setTimeout(() => {
      this.onReset();
      this.irALista();
    }, 1500);
  }

  onReset() {
    this.profesor = new ProfesorModel();
    this.initializeDireccion()
    this.profesorFormValidated = false;
    this.isEditing = false;
    this.editingId = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Método para navegar a la lista
  irALista() {
      this.router.navigate(['/profesor/lista']);                       
  }

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

  // Método para manejar cambios en campos de dirección
  onDireccionChange(field: string, value: string) {
    this.initializeDireccion();
    // Actualizar el campo específico
    (this.profesor.personaData.direccion as any)[field] = value;
  }
}
