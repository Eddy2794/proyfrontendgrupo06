import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfesorCategoriaService } from '../../../services/profesor-categoria.service';
import { ProfesorService } from '../../../services/profesor.service';
import { 
  RowComponent,
  ColComponent, 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  ButtonDirective,
  AlertComponent,
  TableDirective,
  BadgeComponent,
  SpinnerComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalTitleDirective,
  ButtonCloseDirective,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { CategoriaService } from '../../../services/categoria.service';
import { FormsModule } from '@angular/forms';
import { ProfesorModel } from '../../../models/profesor-model';
import { ProfesorCategoria } from '../../../models/profesor-categoria';

@Component({
  selector: 'app-profesor-categoria-list',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    DatePipe,
    ButtonDirective,
    FormsModule,
    AlertComponent,
    TableDirective,
    BadgeComponent,
    SpinnerComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalTitleDirective,
    ButtonCloseDirective,
    TooltipDirective,
    IconDirective,
    NgIf,
    NgFor
  ],
  templateUrl: './profesor-categoria-list.component.html',
  styleUrl: './profesor-categoria-list.component.scss'
})
export class ProfesorCategoriaListComponent implements OnInit {
 
  // ===== PROPIEDADES PRINCIPALES =====
  profesorCategorias: ProfesorCategoria[] = [];
  paginatedItems: ProfesorCategoria[] = [];
  profesores: ProfesorModel[] = [];
  categorias: any[] = [];
  
  // ===== MENSAJES =====
  successMessage = '';
  errorMessage = '';
  
  // ===== ESTADOS DE CARGA =====
  loading = false;
  loadingDetalles = false;
  
  // ===== FILTROS =====
  filtroProfesorId: string = '';
  filtroCategoriaId: string = '';
  
  // ===== PAGINACIÓN =====
  currentPage = 1;
  itemsPerPage = 10;
  
  // ===== MODALES =====
  modalDetallesVisible = false;
  modalEliminarVisible = false;
  profesorCategoriaSeleccionado: ProfesorCategoria | null = null;
  profesorCategoriaAEliminar: ProfesorCategoria | null = null;
  
  constructor(
    private profesorCategoriaService: ProfesorCategoriaService,
    private profesorService: ProfesorService,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getProfesorCategorias();
    this.getProfesores();
    this.getCategorias();
  }

  // ===== MÉTODOS DE CARGA DE DATOS =====
  getProfesorCategorias() {
    this.loading = true;
    this.profesorCategoriaService.getProfesorCategorias().subscribe({
      next: (response: any) => {
        this.profesorCategorias = response.data.profesoresCategorias
          .filter((item: any) => item && item.profesor)
          .map((item: any) => ProfesorCategoria.fromJSON(item));
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las categorías';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  getProfesores() {
    this.profesorService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data.map((profesor: any) => ProfesorModel.fromJSON(profesor));
      },
      error: (error) => {
        console.error('Error al cargar profesores:', error);
      }
    });
  }

  getCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (response: any) => {
        this.categorias = response.data.categorias;
      }
    });
  }

  // ===== MÉTODOS DE PAGINACIÓN =====
  onPageChange(page: number) {
    this.currentPage = page;
    this.actualizarPaginacion();
  }

  private actualizarPaginacion() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedItems = this.profesorCategorias.slice(startIndex, endIndex);
  }

  get totalItems(): number {
    return this.profesorCategorias.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  trackByProfesorCategoria(index: number, profesorCategoria: ProfesorCategoria): string {
    return profesorCategoria._id;
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  updateProfesorCategoria(profesorCategoria: ProfesorCategoria) {
    this.router.navigate(['/profesor-categoria'], { 
      queryParams: { 
        edit: 'true',
        id: profesorCategoria._id
      }
    });
  }

  addProfesorCategoria() {
    this.router.navigate(['/profesor-categoria']);
  }

  // ===== MÉTODOS DE FILTRADO =====
  filtrarProfesor() {
    this.filtroCategoriaId = 'todos';
    if (this.filtroProfesorId === 'todos') {
      this.getProfesorCategorias();
      return;
    }
    this.loading = true;
    this.profesorCategoriaService.getProfesoresCategoriasByProfesorId(this.filtroProfesorId).subscribe({
      next: (response: any) => {
        if (response.data.categorias) {
          this.profesorCategorias = response.data.categorias.map((profesorCategoria: any) => ProfesorCategoria.fromJSON(profesorCategoria));
        } else {
          this.profesorCategorias = [];
        }
        this.currentPage = 1;
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar profesor:', error);
        this.loading = false;
      }
    });
  }

  filtrarCategoria() {
    this.filtroProfesorId = 'todos';
    if (this.filtroCategoriaId === 'todos') {
      this.getProfesorCategorias();
      return;
    }
    this.loading = true;
    this.profesorCategoriaService.getProfesoresCategoriasByCategoriaId(this.filtroCategoriaId).subscribe({
      next: (response: any) => {
        if (response.data.profesores) {
          this.profesorCategorias = response.data.profesores.map((profesorCategoria: any) => ProfesorCategoria.fromJSON(profesorCategoria));
        } else {
          this.profesorCategorias = [];
        }
        this.currentPage = 1;
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar categoría:', error);
        this.loading = false;
      }
    });
  }

  // ===== MÉTODOS DE MODALES =====
  abrirDetalles(profesorCategoria: ProfesorCategoria) {
    this.profesorCategoriaSeleccionado = profesorCategoria;
    this.modalDetallesVisible = true;
  }

  cerrarDetalles() {
    this.modalDetallesVisible = false;
    this.profesorCategoriaSeleccionado = null;
  }

  onModalDetallesChange(visible: boolean) {
    if (!visible) {
      this.cerrarDetalles();
    }
  }

  confirmarEliminacion(profesorCategoria: ProfesorCategoria) {
    this.profesorCategoriaAEliminar = profesorCategoria;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.profesorCategoriaAEliminar = null;
  }

  onModalEliminarChange(visible: boolean) {
    if (!visible) {
      this.cerrarModalEliminar();
    }
  }

  confirmarEliminarProfesorCategoria() {
    if (this.profesorCategoriaAEliminar) {
      this.deleteProfesorCategoria(this.profesorCategoriaAEliminar._id);
      this.cerrarModalEliminar();
    }
  }

  // ===== MÉTODOS DE CRUD =====
  deleteProfesorCategoria(id: string) {
    this.profesorCategoriaService.deleteProfesorCategoria(id).subscribe({
      next: (response: any) => {
        this.profesorCategorias = this.profesorCategorias.filter((pc: any) => pc._id !== id);
        this.actualizarPaginacion();
        this.successMessage = 'Asignación eliminada exitosamente';
      },
      error: (error) => {
        this.errorMessage = 'Error al eliminar la asignación';
        console.error('Error:', error);
      }
    });
  }


  // ===== MÉTODOS DE UTILIDAD =====
  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getLevelBadgeColor(nivel: string): string {
    switch (nivel?.toLowerCase()) {
      case 'principiante': return 'info';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'primary';
      case 'experto': return 'success';
      default: return 'secondary';
    }
  }
}
