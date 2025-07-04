import { Alumno, AlumnoModel } from './alumno.model';
import { Categoria } from './categoria';

// Tipos constantes basados en el backend
export type EstadoAlumnoCategoria = 'ACTIVO' | 'INACTIVO';

// Interfaz principal para AlumnoCategoria
export interface AlumnoCategoria {
  _id?: string;
  alumno: string | Alumno; // ID o objeto completo de Alumno
  categoria: string | Categoria; // ID o objeto completo de Categoria
  fecha_inscripcion: Date | string;
  estado?: EstadoAlumnoCategoria;
  observaciones?: string;
  fecha_baja?: Date | string;
  motivo_baja?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Campos populados (cuando vienen del backend con populate)
  alumno_datos?: Alumno;
  categoria_datos?: Categoria;
}

// Clase para el modelo AlumnoCategoria con validaciones y métodos auxiliares
export class AlumnoCategoriaModel implements AlumnoCategoria {
  _id?: string;
  alumno: string | Alumno;
  categoria: string | Categoria;
  fecha_inscripcion: Date | string;
  estado?: EstadoAlumnoCategoria;
  observaciones?: string;
  fecha_baja?: Date | string;
  motivo_baja?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  alumno_datos?: Alumno;
  categoria_datos?: Categoria;

  constructor(data: Partial<AlumnoCategoria> = {}) {
    this._id = data._id;
    this.alumno = data.alumno || '';
    this.categoria = data.categoria || '';
    this.fecha_inscripcion = data.fecha_inscripcion || new Date();
    this.estado = data.estado || 'ACTIVO';
    this.observaciones = data.observaciones;
    this.fecha_baja = data.fecha_baja;
    this.motivo_baja = data.motivo_baja;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.alumno_datos = data.alumno_datos;
    this.categoria_datos = data.categoria_datos;
  }

  // Método para obtener el nombre del alumno
  get nombreAlumno(): string {
    if (this.alumno_datos) {
      // Si es un AlumnoModel, usar el método nombreAlumno
      if ('nombreAlumno' in this.alumno_datos) {
        return (this.alumno_datos as any).nombreAlumno;
      }
      // Si es un objeto Persona directo, construir el nombre
      if ('nombres' in this.alumno_datos && 'apellidos' in this.alumno_datos) {
        return `${this.alumno_datos.nombres} ${this.alumno_datos.apellidos}`.trim();
      }
    }
    return 'Alumno no identificado';
  }

  // Método para obtener el nombre de la categoría
  get nombreCategoria(): string {
    if (this.categoria_datos) {
      return this.categoria_datos.nombre;
    }
    return 'Categoría no identificada';
  }

  // Método para obtener el ID del alumno
  get alumnoId(): string {
    return typeof this.alumno === 'string' ? this.alumno : this.alumno._id || '';
  }

  // Método para obtener el ID de la categoría
  get categoriaId(): string {
    return typeof this.categoria === 'string' ? this.categoria : this.categoria._id || '';
  }

  // Método para verificar si tiene datos populados
  get tieneDatosCompletos(): boolean {
    return !!(this.alumno_datos && this.categoria_datos);
  }

  // Método para obtener la fecha de inscripción formateada
  get fechaInscripcionFormateada(): string {
    if (!this.fecha_inscripcion) return '';
    const fecha = new Date(this.fecha_inscripcion);
    return fecha.toLocaleDateString('es-ES');
  }

  // Método para obtener la fecha de baja formateada
  get fechaBajaFormateada(): string {
    if (!this.fecha_baja) return '';
    const fecha = new Date(this.fecha_baja);
    return fecha.toLocaleDateString('es-ES');
  }

  // Método para verificar si está activo
  get estaActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  // Método para obtener el estado como texto
  get estadoTexto(): string {
    return this.estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
  }

  // Método para convertir a objeto plano para envío al backend
  toJSON(): any {
    return {
      _id: this._id,
      alumno: this.alumnoId,
      categoria: this.categoriaId,
      fecha_inscripcion: this.fecha_inscripcion,
      estado: this.estado,
      observaciones: this.observaciones,
      fecha_baja: this.fecha_baja,
      motivo_baja: this.motivo_baja,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método estático para crear desde datos del backend
  static fromJSON(data: any): AlumnoCategoriaModel {
    return new AlumnoCategoriaModel(data);
  }
}

// Constantes para usar en formularios y validaciones
export const ESTADOS_ALUMNO_CATEGORIA: { value: EstadoAlumnoCategoria; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' }
];