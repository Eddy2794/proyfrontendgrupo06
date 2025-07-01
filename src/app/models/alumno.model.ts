import { Persona, PersonaModel } from './persona.model';

// Tipos constantes basados en el backend
export type EstadoAlumno = 'ACTIVO' | 'INACTIVO';

// Interfaz principal para Alumno
export interface Alumno {
  _id?: string;
  persona: string | Persona; // ID o objeto completo de Persona
  tutor: string | Persona; // ID o objeto completo de Persona (tutor)
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
  tutor_datos?: Persona;
}

// Clase para el modelo Alumno con validaciones y métodos auxiliares
export class AlumnoModel implements Alumno {
  _id?: string;
  persona: string | Persona;
  tutor: string | Persona;
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
  tutor_datos?: Persona;

  constructor(data: Partial<Alumno> = {}) {
    this._id = data._id;
    this.persona = data.persona || '';
    this.tutor = data.tutor || '';
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
    this.tutor_datos = data.tutor_datos;
  }

  // Método para obtener el nombre del alumno
  get nombreAlumno(): string {
    if (this.persona_datos) {
      return `${this.persona_datos.nombres} ${this.persona_datos.apellidos}`.trim();
    }
    return 'Alumno no identificado';
  }

  // Método para obtener el nombre del tutor
  get nombreTutor(): string {
    if (this.tutor_datos) {
      return `${this.tutor_datos.nombres} ${this.tutor_datos.apellidos}`.trim();
    }
    return 'Tutor no identificado';
  }

  // Método para obtener el ID de la persona (alumno)
  get personaId(): string {
    return typeof this.persona === 'string' ? this.persona : this.persona._id || '';
  }

  // Método para obtener el ID del tutor
  get tutorId(): string {
    return typeof this.tutor === 'string' ? this.tutor : this.tutor._id || '';
  }

  // Método para verificar si tiene datos populados
  get tieneDatosCompletos(): boolean {
    return !!(this.persona_datos && this.tutor_datos);
  }

  // Método para obtener la fecha de inscripción formateada
  get fechaInscripcionFormateada(): string {
    if (!this.fecha_inscripcion) return '';
    const fecha = new Date(this.fecha_inscripcion);
    return fecha.toLocaleDateString('es-ES');
  }

  // Método para convertir a objeto plano para envío al backend
  toJSON(): any {
    return {
      _id: this._id,
      persona: this.personaId,
      tutor: this.tutorId,
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