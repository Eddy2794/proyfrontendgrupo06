import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { AlumnoCategoria } from '../../../models/alumno-categoria.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-alumno-categoria-list',
  imports: [CommonModule],
  templateUrl: './alumno-categoria-list.component.html',
  styleUrls: ['./alumno-categoria-list.component.scss']
})
export class AlumnoCategoriaListComponent implements OnInit {
  relaciones: AlumnoCategoria[] = [];
  loading = false;

  constructor(
    private alumnoCategoriaService: AlumnoCategoriaService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Token actual:', this.authService.token);
    console.log('Usuario autenticado:', this.authService.currentUser);
    this.cargarRelaciones();
  }

  cargarRelaciones() {
    this.loading = true;
    this.alumnoCategoriaService.getAlumnoCategorias().subscribe({
      next: (result) => {
        console.log('Respuesta del backend:', result);
        // Los datos están en result.data.datos según la estructura del backend
        this.relaciones = result.data?.datos || result.datos || result.data || [];
        console.log('Relaciones cargadas:', this.relaciones);
        console.log('Primer alumno_datos:', this.relaciones[0]?.alumno_datos);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar las relaciones:', err);
        alert('Error al cargar las relaciones');
        this.loading = false;
      }
    });
  }

  nuevo() {
    this.router.navigate(['./alumno-categoria-form', '0'], { relativeTo: this.route });
  }

  editar(relacion: AlumnoCategoria) {
    this.router.navigate(['./alumno-categoria-form', relacion._id], { relativeTo: this.route });
  }

  eliminar(relacion: AlumnoCategoria) {
    if (confirm('¿Estás seguro de que deseas eliminar esta relación?')) {
      this.alumnoCategoriaService.deleteAlumnoCategoriaFisico(relacion._id!).subscribe({
        next: () => {
          alert('Relación eliminada correctamente');
          this.cargarRelaciones();
        },
        error: () => {
          alert('Error al eliminar la relación');
        }
      });
    }
  }
} 