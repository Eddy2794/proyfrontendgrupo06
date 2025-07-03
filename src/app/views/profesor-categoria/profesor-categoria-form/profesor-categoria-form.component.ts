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
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  RowDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor } from '@angular/common';
import { ProfesorModel } from '../../../models/profesor-model';
import { CategoriaAuxiliar } from '../../../models/categoria-auxiliar';
import { ProfesorCategoria } from '../../../models/profesor-categoria';
import { CategoriaService } from '../../../services/categoria.service';

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
  profesores: ProfesorModel[] = [];
  categorias: CategoriaAuxiliar[] = [];
  profesorCategoria!: ProfesorCategoria;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  editingId: string | null = null;
  
  
  constructor(
    private profesorCategoriaService: ProfesorCategoriaService, 
    private profesorService: ProfesorService,
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profesorCategoria = new ProfesorCategoria();
  }

  ngOnInit() {
    this.getProfesores();
    this.getCategorias();
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true' && params['id']) {
        this.getProfesorCategoriaById(params['id']);
      } else {
        console.log('No hay datos de categoría para editar');
      }
    });
  }

  getProfesores() {
    this.profesorService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data.map((profesor: any) => ProfesorModel.fromJSON(profesor));
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los profesores';
        console.error('Error:', error);
      }
    });
  }
  
  getCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (response: any) => {
        this.categorias = response.data.categorias;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las categorias';
      }
    });
  }

  mapearProfesorCategoriaForm(profesorCategoria: any) {
    this.isEditing = true;
    this.editingId = profesorCategoria._id;
    // Mapear los datos del backend a la estructura del formulario
    this.profesorCategoria = ProfesorCategoria.fromJSON(profesorCategoria);
    // Asegurar que los objetos de profesor y categoria sean los mismos que los de los arrays
    const { profesor, categoria } = this.profesorCategoria;
    this.profesorCategoria.profesor = this.profesores.find(p => p._id === profesor._id) || profesor;
    this.profesorCategoria.categoria = this.categorias.find(c => c._id === categoria._id) || categoria;
  }

  getProfesorCategoriaById(id: string) {
    this.profesorCategoriaService.getProfesorCategoria(id).subscribe({
      next: (response: any) => {
        this.mapearProfesorCategoriaForm(response.data || response);
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

    if (this.isEditing && this.editingId) {
      this.updateProfesorCategoria();
    } else {
      this.createProfesorCategoria();
    }
  }

  createProfesorCategoria() {
    const payload = {
      ...this.profesorCategoria,
      profesor: this.profesorCategoria.profesor._id,
      categoria: this.profesorCategoria.categoria._id
    };
    this.profesorCategoriaService.createProfesorCategoria(payload).subscribe({
      next: (response: any) => {
        this.successMessage = 'Categoría asignada exitosamente';
        this.isSubmitting = false;
        setTimeout(() => {
          this.onReset();
          this.irALista();
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
    const payload = {
      ...this.profesorCategoria,
      profesor: this.profesorCategoria.profesor._id,
      categoria: this.profesorCategoria.categoria._id
    };
    this.profesorCategoriaService.updateProfesorCategoria(this.editingId!, payload).subscribe({
      next: (response: any) => {
        this.successMessage = 'Categoría actualizada exitosamente';
        this.isSubmitting = false;
        setTimeout(() => {
          this.onReset();
          this.irALista();
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
          this.irALista();
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
    this.irALista();
  }

  onReset() {
    this.profesorCategoria = new ProfesorCategoria();
    this.profesorCategoriaFormValidated = false;
    this.isEditing = false;
    this.editingId = null;
    this.successMessage = '';
    this.errorMessage = '';
  }
  // Método para navegar a la lista
  irALista() {
      this.router.navigate(['/profesor-categoria/lista']);
  }
}
