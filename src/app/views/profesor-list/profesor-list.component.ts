import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfesorService } from '../../services/profesor.service';
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
import { NgIf, NgFor, DatePipe, DecimalPipe } from '@angular/common';
import { ProfesorModel } from '../../models/profesor-model';

@Component({
  selector: 'app-profesor-list',
  standalone: true,
  imports: [
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
    TooltipDirective,
    IconDirective,
    NgIf,
    NgFor,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './profesor-list.component.html',
  styleUrl: './profesor-list.component.scss'
})
export class ProfesorListComponent implements OnInit {
 
  // ===== PROPIEDADES PRINCIPALES =====
  profesores: ProfesorModel[] = [];
  paginatedItems: ProfesorModel[] = [];
  
  // ===== MENSAJES =====
  successMessage = '';
  errorMessage = '';
  
  // ===== ESTADOS DE CARGA =====
  loading = false;
  loadingDetalles = false;
  
  // ===== PAGINACIÓN =====
  currentPage = 1;
  itemsPerPage = 10;
  
  // ===== MODALES =====
  modalDetallesVisible = false;
  modalEliminarVisible = false;
  profesorSeleccionado: ProfesorModel | null = null;
  profesorAEliminar: ProfesorModel | null = null;
  
  constructor(
    private profesorService: ProfesorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getProfesores();
  }

  // ===== MÉTODOS DE CARGA DE DATOS =====
  getProfesores() {
    this.loading = true;
    this.profesorService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data.map((prof: any) => ProfesorModel.fromJSON(prof));
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los profesores';
        this.loading = false;
        console.error('Error:', error);
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
    this.paginatedItems = this.profesores.slice(startIndex, endIndex);
  }

  get totalItems(): number {
    return this.profesores.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  trackByProfesor(index: number, profesor: ProfesorModel): string {
    return profesor._id;
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  editProfesor(profesor: ProfesorModel) {
    this.router.navigate(['/profesor'], { 
      queryParams: { 
        edit: 'true',
        id: profesor._id
      }
    });
  }

  addProfesor() {
    this.router.navigate(['/profesor']);
  }
  
  // ===== MÉTODOS DE MODALES =====
  abrirDetalles(profesor: ProfesorModel) {
    this.profesorSeleccionado = profesor;
    this.modalDetallesVisible = true;
    this.cargarDetallesProfesor(profesor._id);
  }

  cerrarDetalles() {
    this.modalDetallesVisible = false;
    this.profesorSeleccionado = null;
  }

  onModalDetallesChange(visible: boolean) {
    if (!visible) {
      this.cerrarDetalles();
    }
  }

  confirmarEliminacion(profesor: ProfesorModel) {
    this.profesorAEliminar = profesor;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.profesorAEliminar = null;
  }

  onModalEliminarChange(visible: boolean) {
    if (!visible) {
      this.cerrarModalEliminar();
    }
  }

  confirmarEliminarProfesor() {
    if (this.profesorAEliminar) {
      this.deleteProfesor(this.profesorAEliminar._id);
      this.cerrarModalEliminar();
    }
  }

  // ===== MÉTODOS DE CRUD =====
  deleteProfesor(id: string) {
      this.profesorService.deleteProfesor(id).subscribe({
        next: (response: any) => {
          this.successMessage = 'Profesor eliminado exitosamente';
          this.getProfesores();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el profesor';
          console.error('Error:', error);
        }
      });
    }

  // ===== MÉTODOS DE UTILIDAD =====
  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getExperienceBadgeColor(experiencia: number): string {
    if (experiencia <= 5) return 'info';
    if (experiencia <= 10) return 'warning';
    if (experiencia <= 15) return 'primary';
    return 'success';
  }

  getDireccionCompleta(profesor: ProfesorModel): string {
    if (!profesor.personaData.direccion) return '';
    
    const dir = profesor.personaData.direccion;
    const partes = [
      dir.calle,
      dir.ciudad,
      dir.departamento,
      dir.codigoPostal,
      dir.pais
    ].filter(Boolean);
    
    return partes.join(', ');
  }

  // ===== MÉTODOS DE CARGA DE DETALLES =====
  private cargarDetallesProfesor(profesorId: string) {
    this.loadingDetalles = true;
    
    // Simular carga de datos adicionales
    setTimeout(() => {
      this.loadingDetalles = false;
    }, 1000);
  }
}