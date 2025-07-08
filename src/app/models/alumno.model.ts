import { Persona, PersonaModel } from './persona.model';
import { Categoria } from './categoria';

// Tipos constantes basados en el backend
export type EstadoAlumno = 'ACTIVO' | 'INACTIVO';

// Interfaz principal para Alumno
export interface Alumno {
  _id?: string;
  persona: string | Persona; // ID o objeto completo de Persona
  tutor: string | import('./user.model').User; // ID o User
  categoriaPrincipal: string | Categoria; // ID o objeto completo de Categoria
  numero_socio: string;
  observaciones_medicas?: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  autoriza_fotos: boolean;
  fecha_inscripcion: Date | string;
  estado?: EstadoAlumno;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Campos populados (cuando vienen del backend con populate)
  persona_datos?: Persona;
  categoria_datos?: Categoria; // Categoria
}

// Clase para el modelo Alumno con validaciones y métodos auxiliares
export class AlumnoModel implements Alumno {
  _id?: string;
  persona: string | Persona;
  tutor: string | import('./user.model').User;
  categoriaPrincipal: string | Categoria;
  numero_socio: string;
  observaciones_medicas?: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  autoriza_fotos: boolean;
  fecha_inscripcion: Date | string;
  estado?: EstadoAlumno;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  persona_datos?: Persona;
  categoria_datos?: Categoria;

  constructor(data: Partial<Alumno> = {}) {
    this._id = data._id;
    this.persona = data.persona || '';
    this.tutor = data.tutor || '';
    this.categoriaPrincipal = data.categoriaPrincipal || '';
    this.numero_socio = data.numero_socio || '';
    this.observaciones_medicas = data.observaciones_medicas;
    this.contacto_emergencia = data.contacto_emergencia || '';
    this.telefono_emergencia = data.telefono_emergencia || '';
    this.autoriza_fotos = data.autoriza_fotos || false;
    this.fecha_inscripcion = data.fecha_inscripcion || new Date();
    this.estado = data.estado || 'ACTIVO';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.persona_datos = data.persona_datos;
    this.categoria_datos = data.categoria_datos;
  }

  // Método para obtener el nombre del alumno
  get nombreAlumno(): string {
    if (this.persona_datos) {
      return `${this.persona_datos.nombres} ${this.persona_datos.apellidos}`.trim();
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

  // Método para obtener el ID de la persona (alumno)
  get personaId(): string {
    return typeof this.persona === 'string' ? this.persona : this.persona._id || '';
  }

  // Método para obtener el ID del tutor
  get tutorId(): string {
    if (typeof this.tutor === 'string') return this.tutor;
    if (this.tutor && typeof this.tutor === 'object' && '_id' in this.tutor) return this.tutor._id || '';
    return '';
  }

  // Método para obtener el ID de la categoría principal
  get categoriaPrincipalId(): string {
    if (typeof this.categoriaPrincipal === 'string') return this.categoriaPrincipal;
    if (this.categoriaPrincipal && typeof this.categoriaPrincipal === 'object' && '_id' in this.categoriaPrincipal) return this.categoriaPrincipal._id || '';
    return '';
  }

  // Método para verificar si tiene datos populados
  get tieneDatosCompletos(): boolean {
    return !!(this.persona_datos && this.categoria_datos);
  }

  // Método para obtener la fecha de inscripción formateada
  get fechaInscripcionFormateada(): string {
    if (!this.fecha_inscripcion) return '';
    const fecha = new Date(this.fecha_inscripcion);
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
      persona: this.personaId,
      tutor: this.tutorId,
      categoriaPrincipal: this.categoriaPrincipalId,
      numero_socio: this.numero_socio,
      observaciones_medicas: this.observaciones_medicas,
      contacto_emergencia: this.contacto_emergencia,
      telefono_emergencia: this.telefono_emergencia,
      autoriza_fotos: this.autoriza_fotos,
      fecha_inscripcion: this.fecha_inscripcion,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método estático para crear desde datos del backend
  static fromJSON(data: any): AlumnoModel {
    return new AlumnoModel(data);
  }
}

// Constantes para usar en formularios y validaciones
export const ESTADOS_ALUMNO: { value: EstadoAlumno; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' }
];  