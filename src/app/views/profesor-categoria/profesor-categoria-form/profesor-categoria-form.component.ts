import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfesorCategoriaService } from '../../../services/profesor-categoria.service';
import { ProfesorService } from '../../../services/profesor.service';
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
//import { CategoriaService } from '../../../services/categoria.service';

@Component({
  selector: 'app-profesor-categoria-form',
  standalone: true,
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
  templateUrl: './profesor-categoria-form.component.html',
  styleUrl: './profesor-categoria-form.component.scss'
})
export class ProfesorCategoriaFormComponent implements OnInit {
  
  profesorCategoriaFormValidated = false;
  profesores: any[] = [];
  categorias: any[] = [];
  profesorCategoria: any = {
    profesor: '',
    categoria: '',
    fecha_asignacion: '',
    activo: true,
    observaciones: '',
    _id: '',
    fechaAsignacion: new Date().toISOString().split('T')[0]
  };
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  editingId: string | null = null;
  
  
  constructor(
    private profesorCategoriaService: ProfesorCategoriaService, 
    private profesorService: ProfesorService,
 //   private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getProfesores();
    //this.getCategorias();
    
    // Verificar si hay datos de navegación para editar
    const state = history.state;
    console.log('Estado de navegación:', state);
    
    if (state && state.profesorCategoria && state.isEditing) {
      console.log('Cargando categoría para editar desde state:', state.profesorCategoria);
      this.loadProfesorCategoriaForEdit(state.profesorCategoria);
    } else {
      // Verificar si hay parámetros de ruta para editar
      this.route.queryParams.subscribe(params => {
        console.log('Parámetros de ruta:', params);
        if (params['edit'] === 'true' && params['id']) {
          console.log('Cargando categoría desde parámetros de ruta, ID:', params['id']);
          this.loadProfesorCategoriaById(params['id']);
        } else {
          console.log('No hay datos de categoría para editar');
        }
      });
    }
  }

  getProfesores() {
    this.profesorService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data;
        console.log('Profesores cargados:', this.profesores);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los profesores';
        console.error('Error:', error);
      }
    });
  }

  /*getCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (response: any) => {
        console.log("categorias desde el form", response);
        this.categorias = response.data.categorias;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las categorias';
      }
    });
  }*/

  loadProfesorCategoriaForEdit(profesorCategoria: any) {
    console.log('Iniciando loadProfesorCategoriaForEdit con:', profesorCategoria);
    this.isEditing = true;
    this.editingId = profesorCategoria._id;
    console.log('categoría que llega para editar ', profesorCategoria);
    
    // Mapear los datos del backend a la estructura del formulario
    this.profesorCategoria = {
      profesor: typeof profesorCategoria.profesor === 'object' && profesorCategoria.profesor !== null
        ? profesorCategoria.profesor._id
        : profesorCategoria.profesor || '',
      categoria: typeof profesorCategoria.categoria === 'object' && profesorCategoria.categoria !== null
        ? profesorCategoria.categoria._id
        : profesorCategoria.categoria || '',
      fecha_asignacion: profesorCategoria.fecha_asignacion ? new Date(profesorCategoria.fecha_asignacion).toISOString().split('T')[0] : '',
      activo: profesorCategoria.activo !== undefined ? profesorCategoria.activo : true,
      observaciones: profesorCategoria.observaciones || '',
      _id: profesorCategoria._id || '',
      fechaAsignacion: new Date().toISOString().split('T')[0]
    };
    console.log('Categoría mapeada:', this.profesorCategoria);
  }

  loadProfesorCategoriaById(id: string) {
    console.log('Cargando categoría por ID:', id);
    this.profesorCategoriaService.getProfesorCategoria(id).subscribe({
      next: (response: any) => {
        console.log('Categoría cargada desde servicio:', response);
        this.loadProfesorCategoriaForEdit(response.data || response);
      },
      error: (error) => {
        console.error('Error al cargar categoría:', error);
        this.errorMessage = 'Error al cargar los datos de la categoría';
      }
    });
  }

  onSubmit() {
    // Marcar el formulario como validado para mostrar errores
    this.profesorCategoriaFormValidated = true;
    
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    // Asigna la fecha de hoy en formato ISO (yyyy-mm-dd)
    this.profesorCategoria.fecha_asignacion = new Date().toISOString().split('T')[0];

    if (this.isEditing && this.editingId) {
      this.updateProfesorCategoria();
    } else {
      this.createProfesorCategoria();
    }
  }

  createProfesorCategoria() {
    const { _id, ...profesorCategoriaSinId } = this.profesorCategoria;
    console.log("profesorCategoriaSinId: ", profesorCategoriaSinId);
    
    this.profesorCategoriaService.createProfesorCategoria(profesorCategoriaSinId).subscribe({
      next: (response: any) => {
        this.successMessage = 'Categoría asignada exitosamente';
        this.onReset();
        this.isSubmitting = false;
        // Navegar a la lista después de crear
        setTimeout(() => {
          this.router.navigate(['/profesor-categoria/lista']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = 'El profesor ya esta asignado a esta categoría';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }

  updateProfesorCategoria() {
    console.log('updateProfesorCategoria', this.editingId, this.profesorCategoria);
  
    this.profesorCategoriaService.updateProfesorCategoria(this.editingId!, this.profesorCategoria).subscribe({
      next: (response: any) => {
        this.successMessage = 'Categoría actualizada exitosamente';
        this.onReset();
        this.isSubmitting = false;
        this.isEditing = false;
        this.editingId = null;
        // Navegar a la lista después de actualizar
        setTimeout(() => {
          this.router.navigate(['/profesor-categoria/lista']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar la categoría';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }

  deleteProfesorCategoria() {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.profesorCategoriaService.deleteProfesorCategoria(this.editingId!).subscribe({
        next: (response: any) => {
          this.successMessage = 'Categoría eliminada exitosamente';
          // Navegar a la lista después de eliminar
          setTimeout(() => {
            this.router.navigate(['/profesor-categoria/lista']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la categoría';
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
    this.router.navigate(['/profesor-categoria/lista']);
  }

  onReset() {
    this.profesorCategoria = {
      profesor: '',
      categoria: '',
      fecha_asignacion: '',
      activo: true,
      observaciones: '',
      _id: '',
      fechaAsignacion: new Date().toISOString().split('T')[0]
    };
    this.profesorCategoriaFormValidated = false;
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
    this.router.navigate(['/profesor-categoria/lista']);
  }
}
