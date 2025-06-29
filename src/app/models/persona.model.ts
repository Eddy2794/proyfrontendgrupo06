// Tipos constantes basados en el backend
export type TipoDocumento = 'DNI' | 'PASAPORTE' | 'CEDULA' | 'CARNET_EXTRANJERIA';
export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFIERO_NO_DECIR';
export type EstadoPersona = 'ACTIVO' | 'INACTIVO';

// Interfaz para la dirección
export interface Direccion {
  calle?: string;
  ciudad?: string;
  departamento?: string;
  codigoPostal?: string;
  pais?: string;
}

// Interfaz principal para Persona
export interface Persona {
  _id?: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento: Date | string;
  genero: Genero;
  telefono?: string;
  email: string;
  direccion?: Direccion;
  estado?: EstadoPersona;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Clase para el modelo Persona con validaciones y métodos auxiliares
export class PersonaModel implements Persona {
  _id?: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento: Date | string;
  genero: Genero;
  telefono?: string;
  email: string;
  direccion?: Direccion;
  estado?: EstadoPersona;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  constructor(data: Partial<Persona> = {}) {
    this._id = data._id;
    this.nombres = data.nombres || '';
    this.apellidos = data.apellidos || '';
    this.tipoDocumento = data.tipoDocumento || 'DNI';
    this.numeroDocumento = data.numeroDocumento || '';
    this.fechaNacimiento = data.fechaNacimiento || '';
    this.genero = data.genero || 'MASCULINO';
    this.telefono = data.telefono;
    this.email = data.email || '';
    this.direccion = data.direccion;
    this.estado = data.estado || 'ACTIVO';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Método para obtener el nombre completo
  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`.trim();
  }

  // Método para validar la edad mínima (18 años)
  get esAdulto(): boolean {
    if (!this.fechaNacimiento) return false;
    
    const fecha = new Date(this.fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    const mesNacimiento = fecha.getMonth();
    const diaNacimiento = fecha.getDate();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
      return edad - 1 >= 18;
    }
    
    return edad >= 18;
  }

  // Método para obtener la dirección completa como string
  get direccionCompleta(): string {
    if (!this.direccion) return '';
    
    const partes = [
      this.direccion.calle,
      this.direccion.ciudad,
      this.direccion.departamento,
      this.direccion.codigoPostal,
      this.direccion.pais
    ].filter(Boolean);
    
    return partes.join(', ');
  }

  // Método para convertir a objeto plano para envío al backend
  toJSON(): any {
    return {
      _id: this._id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento,
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
      telefono: this.telefono,
      email: this.email,
      direccion: this.direccion,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método estático para crear desde datos del backend
  static fromJSON(data: any): PersonaModel {
    return new PersonaModel(data);
  }
}

// Constantes para usar en formularios y validaciones
export const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'CARNET_EXTRANJERIA', label: 'Carnet de Extranjería' }
];

export const GENEROS: { value: Genero; label: string }[] = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' },
  { value: 'PREFIERO_NO_DECIR', label: 'Prefiero no decir' }
];

export const ESTADOS_PERSONA: { value: EstadoPersona; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' }
];
