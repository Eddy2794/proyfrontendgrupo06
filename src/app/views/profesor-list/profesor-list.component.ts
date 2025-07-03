import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgIf, NgFor } from '@angular/common';

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
    IconDirective,
    NgIf,
    NgFor
  ],
  templateUrl: './profesor-list.component.html',
  styleUrl: './profesor-list.component.scss'
})
export class ProfesorListComponent implements OnInit {
 
  profesores: any[] = [];
  successMessage = '';
  errorMessage = '';
  
  constructor(
    private profesorService: ProfesorService,
    private router: Router
  ) {}

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

  editProfesor(profesor: any) {
    // Navegar al formulario con los datos del profesor para editar
    this.router.navigate(['/profesor'], { 
      queryParams: { 
        edit: 'true',
        id: profesor._id
      }
    });
  }

  addProfesor() {
    // Navegar al formulario para crear un nuevo profesor
    this.router.navigate(['/profesor']);
  }
  
  deleteProfesor(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
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
  }
}
