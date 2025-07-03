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
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { CategoriaService } from '../../../services/categoria.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
    IconDirective,
    NgIf,
    NgFor,
    NgClass
  ],
  templateUrl: './profesor-categoria-list.component.html',
  styleUrl: './profesor-categoria-list.component.scss'
})
export class ProfesorCategoriaListComponent implements OnInit {
 
  profesorCategorias: ProfesorCategoria[] = [];
  profesores:ProfesorModel[] = [];
  successMessage = '';
  errorMessage = '';
  filtroProfesorId: string = '';
  filtroCategoriaId: string = '';
  categorias: any[] = [];
  
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

  getProfesorCategorias() {
    this.profesorCategoriaService.getProfesorCategorias().subscribe({
      next: (response: any) => {
        console.log("response desde el list", response.data.profesoresCategorias);
        this.profesorCategorias = response.data.profesoresCategorias
          .filter((item: any) => item && item.profesor)
          .map((item: any) => ProfesorCategoria.fromJSON(item));
        console.log(this.profesorCategorias);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las categorías';
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
        console.log(response);
        this.categorias = response.data.categorias;
      }
    });
  }
  
  updateProfesorCategoria(profesorCategoria: any) {
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
  
  deleteProfesorCategoria(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.profesorCategoriaService.deleteProfesorCategoria(id).subscribe({
        next: (response: any) => {
          this.profesorCategorias = this.profesorCategorias.filter((pc: any) => pc._id !== id);
          this.successMessage = 'Categoría eliminada exitosamente';
          this.getProfesorCategorias();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la categoría';
          console.error('Error:', error);
        }
      });
    }
  }

  filtrarProfesor() {
    console.log('filtroProfesorId:', this.filtroProfesorId);
    this.filtroCategoriaId = 'todos';
    if (this.filtroProfesorId === 'todos') {
      this.getProfesorCategorias();
      return;
    }
    this.profesorCategoriaService.getProfesoresCategoriasByProfesorId(this.filtroProfesorId).subscribe({
      next: (response: any) => {
        if (response.data.categorias) {
          this.profesorCategorias = response.data.categorias.map((profesorCategoria: any) => ProfesorCategoria.fromJSON(profesorCategoria));
        } else {
          this.profesorCategorias = [];
        }
      },
      error: (error) => {
        console.error('Error al filtrar profesor:', error);
      }
    });
  }

  filtrarCategoria() {
    console.log('filtroCategoriaId:', this.filtroCategoriaId);
    this.filtroProfesorId = 'todos';
    if (this.filtroCategoriaId === 'todos') {
      this.getProfesorCategorias();
      return;
    }
    this.profesorCategoriaService.getProfesoresCategoriasByCategoriaId(this.filtroCategoriaId).subscribe({
      next: (response: any) => {
        if (response.data.profesores) {
          this.profesorCategorias = response.data.profesores.map((profesorCategoria: any) => ProfesorCategoria.fromJSON(profesorCategoria));
        } else {
          this.profesorCategorias = [];
        }
      },
      error: (error) => {
        console.error('Error al filtrar categoría:', error);
      }
    });
  }
}
