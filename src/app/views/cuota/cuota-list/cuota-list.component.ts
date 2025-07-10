import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CuotaService } from '../../../services/cuota.service';
import { CuotaModel } from '../../../models/cuota.model';
import { CommonModule } from '@angular/common';
import { FormModule } from '@coreui/angular';
import { AlumnoCategoriaService } from '../../../services/alumno-categoria.service';
import { CategoriaService } from '../../../services/categoria.service';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  TableDirective,
  ButtonDirective,
  BadgeComponent,
  TooltipDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
@Component({
  standalone: true,
  selector: 'app-cuota-list',
  imports: [
    CommonModule,
    FormModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    BadgeComponent,
    TooltipDirective,
    IconDirective,
    FormsModule,
    InputGroupComponent,
    InputGroupTextDirective,
    SpinnerComponent
  ],
  templateUrl: './cuota-list.component.html',
  styleUrls: ['./cuota-list.component.scss']
})
export class CuotaListComponent {
  cuotas: CuotaModel[] = [];
  cuotasFiltradas: CuotaModel[] = [];
  @Output() verDetalle = new EventEmitter<CuotaModel>();
  @Output() modificar = new EventEmitter<CuotaModel>();
  @Output() nuevaCuota = new EventEmitter<void>();
  @Output() pagar = new EventEmitter<CuotaModel>();
  @Output() pagarEfectivo = new EventEmitter<CuotaModel>();
  relacionesAlumnoCategoria: any[] = [];
  categorias: any[] = [];
  
  // Filtros
  searchTerm: string = '';
  selectedEstado: string | undefined;
  selectedCategoria: string | undefined;
  selectedMes: string | undefined;
  selectedAnio: string | undefined;

  // Meses y años disponibles
  meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];
  anios: number[] = [];

  // Función auxiliar para convertir nombre de mes a número
  private mesToNumero(mes: string): number | null {
    if (!mes) return null;
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const idx = meses.indexOf(mes.toUpperCase());
    return idx >= 0 ? idx + 1 : null;
  }

  // Estado de carga
  isLoading: boolean = false;

  constructor(
    private cuotaService: CuotaService,
    private alumnoCategoriaService: AlumnoCategoriaService,
    private categoriaService: CategoriaService,
    public authService: AuthService
  ) {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading = true;
    this.getCuotas();
    this.getRelacionesAlumnoCategoria();
    this.getCategorias();
    this.generarAnios();
  }

  getCuotas() {
    this.cuotaService.getCuotas().subscribe({
      next: (result) => {
        console.log('Respuesta cuotas:', result);
        this.cuotas = Array.isArray(result.data) ? result.data.map((c: any) => CuotaModel.fromJSON(c)) : [];
        this.cuotasFiltradas = [...this.cuotas];
        this.isLoading = false;
        console.log('Cuotas mapeadas:', this.cuotas);
        // Debug: mostrar estructura de la primera cuota
        if (this.cuotas.length > 0) {
          console.log('Estructura de la primera cuota:', this.cuotas[0]);
          console.log('alumno_categoria_id:', this.cuotas[0].alumno_categoria_id);
          console.log('alumno_categoria_datos:', this.cuotas[0].alumno_categoria_datos);
        }
      },
      error: (err) => {
        console.error('Error al cargar cuotas:', err);
        this.isLoading = false;
      }
    });
  }

  getRelacionesAlumnoCategoria() {
    this.alumnoCategoriaService.getAlumnoCategorias().subscribe({
      next: (result) => {
        if (result.data && Array.isArray(result.data.datos)) {
          this.relacionesAlumnoCategoria = result.data.datos;
        } else {
          this.relacionesAlumnoCategoria = [];
        }
      },
      error: () => {
        this.relacionesAlumnoCategoria = [];
      }
    });
  }

  getCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (result) => {
        if (result.data && Array.isArray(result.data.categorias)) {
          this.categorias = result.data.categorias;
        } else {
          this.categorias = [];
        }
      },
      error: () => {
        this.categorias = [];
      }
    });
  }

  generarAnios() {
    const currentYear = new Date().getFullYear();
    this.anios = [];
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      this.anios.push(year);
    }
  }

  // Métodos de filtrado usando endpoints específicos
  onSearch(term: string) {
    this.searchTerm = term;
    this.aplicarFiltros();
  }

  onEstadoFilter(estado: string | undefined) {
    this.selectedEstado = estado;
    this.aplicarFiltros();
  }

  onCategoriaFilter(categoriaId: string | undefined) {
    this.selectedCategoria = categoriaId;
    this.aplicarFiltros();
  }

  onMesFilter(mes: string | undefined) {
    this.selectedMes = mes;
    this.aplicarFiltros();
  }

  onAnioFilter(anio: string | undefined) {
    this.selectedAnio = anio;
    this.aplicarFiltros();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedEstado = undefined;
    this.selectedCategoria = undefined;
    this.selectedMes = undefined;
    this.selectedAnio = undefined;
    this.cuotasFiltradas = [...this.cuotas];
  }

  aplicarFiltros() {
    this.isLoading = true;
    // Siempre filtrar en frontend
    let cuotasFiltradas = [...this.cuotas];

    // Filtro por estado
    if (this.selectedEstado) {
      if (this.selectedEstado === 'VENCIDA') {
        cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) => cuota.estado === 'VENCIDA');
      } else {
        cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) => cuota.estado === this.selectedEstado);
      }
    }

    // Filtro por mes y año
    if (this.selectedMes && this.selectedAnio) {
      cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) => {
        const mesCuota = typeof cuota.mes === 'number' ? cuota.mes : (parseInt(cuota.mes) || this.mesToNumero(cuota.mes));
        return mesCuota?.toString() === this.selectedMes && cuota.anio?.toString() === this.selectedAnio;
      });
    } else if (this.selectedMes) {
      cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) => {
        const mesCuota = typeof cuota.mes === 'number' ? cuota.mes : (parseInt(cuota.mes) || this.mesToNumero(cuota.mes));
        return mesCuota?.toString() === this.selectedMes;
      });
    } else if (this.selectedAnio) {
      cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) => cuota.anio?.toString() === this.selectedAnio);
    }

    // Filtro por categoría
    if (this.selectedCategoria) {
      cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) => {
        // Verificar si los datos están populados en alumno_categoria_id
        if (cuota.alumno_categoria_id && typeof cuota.alumno_categoria_id === 'object') {
          // Si los datos están populados directamente en alumno_categoria_id
          const categoria = (cuota.alumno_categoria_id as any).categoria;
          if (categoria && typeof categoria === 'object' && categoria._id) {
            return categoria._id === this.selectedCategoria;
          }
        }
        return false;
      });
    }

    // Filtro por búsqueda
    if (this.searchTerm) {
      cuotasFiltradas = cuotasFiltradas.filter((cuota: CuotaModel) =>
        this.getNombreAlumno(cuota).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.cuotasFiltradas = cuotasFiltradas;
    this.isLoading = false;
  }

  onVerDetalle(cuota: CuotaModel) {
    this.verDetalle.emit(cuota);
  }

  onModificar(cuota: CuotaModel) {
    this.modificar.emit(cuota);
  }

  onEliminar(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar esta cuota?')) {
      this.cuotaService.softDeleteCuota(id).subscribe({
        next: result => {
          if (result.success == true) {
            alert("La cuota se eliminó correctamente (eliminación lógica)");
            this.getCuotas();
          }
        },
        error: error => {
          alert("Ocurrió un error al eliminar");
          console.log(error);
        }
      })
    }
  }

  onNuevaCuota() {
    this.nuevaCuota.emit();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge bg-warning';
      case 'PAGA': return 'badge bg-success';
      case 'VENCIDA': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getNombreAlumno(c: any): string {
    const rel = c.alumno_categoria_id;
    if (
      rel &&
      typeof rel === 'object' &&
      rel.alumno &&
      rel.alumno.persona
    ) {
      return `${rel.alumno.persona.nombres} ${rel.alumno.persona.apellidos}`;
    }
    return 'No identificado';
  }

  getNombreCategoria(c: any): string {
    if (
      c.alumno_categoria_id &&
      typeof c.alumno_categoria_id === 'object' &&
      (c.alumno_categoria_id as any).categoria
    ) {
      return (c.alumno_categoria_id as any).categoria.nombre;
    }
    return 'No identificada';
  }

  onPagar(cuota: CuotaModel) {
    this.pagar.emit(cuota);
  }

  onPagarEfectivo(cuota: CuotaModel) {
    this.pagarEfectivo.emit(cuota);
  }
}
