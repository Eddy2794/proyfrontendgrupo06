import { Component, OnInit } from '@angular/core';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { Router } from '@angular/router';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData } from 'chart.js';


@Component({
  selector: 'app-categoria',
  imports: [CommonModule, FormsModule, RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, ChartjsComponent],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})
export class CategoriaComponent implements OnInit {
  chartBarData: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Alumnos por Categoría',
        backgroundColor: '#f87979',
        data: []
      }
    ]
  };

  chartPieData: ChartData = {
    labels: ['Activas', 'Inactivas'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384']
      }
    ]
  };

  categorias: Categoria[] = [];
  loading = false;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias() {
    this.loading = true;
    console.log('Iniciando carga de categorías...');
    this.categoriaService.getCategorias().subscribe({
      next: result => {
        console.log('Respuesta del servidor:', result);
        if (result.success) {
                    this.categorias = result.data.categorias || [];
          this.updateChartData();
          console.log('Categorías cargadas:', this.categorias);
        } else {
          console.log('Respuesta sin éxito:', result);
        }
        this.loading = false;
      },
      error: error => {
        console.error('Error al cargar categorías:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        alert('Error al cargar las categorías');
        this.loading = false;
      }
    });
  }

  agregarCategoria() {
    this.router.navigate(['/categoria-form', '0']);
  }

  modificarCategoria(categoria: Categoria) {
    this.router.navigate(['/categoria-form', categoria._id]);
  }

  eliminarCategoria(categoria: Categoria) {
    if (confirm(`¿Está seguro que desea eliminar la categoría "${categoria.nombre}"?`)) {
      this.categoriaService.deleteCategoria(categoria._id!).subscribe({
        next: result => {
          if (result.success) {
            alert('Categoría eliminada correctamente');
            this.getCategorias();
          }
        },
        error: error => {
          console.error('Error al eliminar categoría:', error);
          alert('Error al eliminar la categoría');
        }
      });
    }
  }

  toggleEstadoCategoria(categoria: Categoria) {
    const accion = categoria.activa ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro que desea ${accion} la categoría "${categoria.nombre}"?`)) {
      const servicio = categoria.activa ?
        this.categoriaService.deactivateCategoria(categoria._id!) :
        this.categoriaService.activateCategoria(categoria._id!);

      servicio.subscribe({
        next: result => {
          if (result.success) {
            alert(`Categoría ${accion === 'activar' ? 'activada' : 'desactivada'} correctamente`);
            this.getCategorias();
          }
        },
        error: error => {
          console.error(`Error al ${accion} categoría:`, error);
          alert(`Error al ${accion} la categoría`);
        }
      });
    }
  }

  formatearHorarios(horarios: any[]): string {
    if (!horarios || horarios.length === 0) {
      return 'Sin horarios';
    }
    return horarios.map(h => `${h.dia}: ${h.hora_inicio}-${h.hora_fin}`).join(', ');
  }

  getRangoEdad(categoria: Categoria): string {
    return `${categoria.edad_min} - ${categoria.edad_max} años`;
  }

  private updateChartData(): void {
    const labels = this.categorias.map(c => c.nombre);
    const data = this.categorias.map(c => c.alumnos_actuales);
    this.chartBarData = {
      labels: labels,
      datasets: [
        {
          label: 'Alumnos por Categoría',
          backgroundColor: '#f87979',
          data: data
        }
      ]
    };

    const activas = this.categorias.filter(c => c.activa).length;
    const inactivas = this.categorias.length - activas;
    this.chartPieData = {
      labels: ['Activas', 'Inactivas'],
      datasets: [
        {
          data: [activas, inactivas],
          backgroundColor: ['#36A2EB', '#FF6384'],
          hoverBackgroundColor: ['#36A2EB', '#FF6384']
        }
      ]
    };
  }
}