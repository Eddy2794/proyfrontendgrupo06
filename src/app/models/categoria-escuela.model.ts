export interface CategoriaEscuela {
  _id?: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  edadMinima: number;
  edadMaxima: number;
  precio: {
    cuotaMensual: number;
    descuentos?: {
      hermanos?: number;
      pagoAnual?: number;
      primeraVez?: number;
    };
  };
  estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  cupoMaximo?: number;
  horarios?: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>;
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
  creadoPor?: string;
  actualizadoPor?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CreateCategoriaEscuelaRequest {
  nombre: string;
  descripcion: string;
  tipo: string;
  edadMinima: number;
  edadMaxima: number;
  precio: {
    cuotaMensual: number;
    descuentos?: {
      hermanos?: number;
      pagoAnual?: number;
      primeraVez?: number;
    };
  };
  estado?: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  cupoMaximo?: number;
  horarios?: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>;
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
}

export interface UpdateCategoriaEscuelaRequest {
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  edadMinima?: number;
  edadMaxima?: number;
  precio?: {
    cuotaMensual?: number;
    descuentos?: {
      hermanos?: number;
      pagoAnual?: number;
      primeraVez?: number;
    };
  };
  estado?: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  cupoMaximo?: number;
  horarios?: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>;
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
}

export interface CategoriasResponse {
  categorias: CategoriaEscuela[];
  total: number;
  filtrosAplicados?: any;
}
