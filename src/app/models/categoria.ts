export interface Categoria {
  _id?: string;
  nombre: string;
  descripcion: string;
  edadMinima: number;
  edadMaxima: number;
  tipo: 'INFANTIL' | 'JUVENIL' | 'COMPETITIVO' | 'RECREATIVO' | 'ENTRENAMIENTO';
  estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  precio: {
    cuotaMensual: number;
    descuentos?: {
      hermanos?: number;
      pagoAnual?: number;
      primeraVez?: number;
    };
  };
  cupoMaximo: number;
  profesor?: string;
  horarios?: Horario[];
  configuracionPago?: {
    habilitarDescuentos: boolean;
    metodosPermitidos: string[];
  };
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
  nivel?: string;
  alumnosActuales?: number;
  creadoPor?: string;
  actualizadoPor?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  
  // Campos de compatibilidad eliminados - usar solo nomenclatura nueva
}

export class CategoriaClass implements Categoria {
  _id?: string;
  nombre: string;
  descripcion: string;
  edadMinima: number;
  edadMaxima: number;
  tipo: 'INFANTIL' | 'JUVENIL' | 'COMPETITIVO' | 'RECREATIVO' | 'ENTRENAMIENTO';
  estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  precio: {
    cuotaMensual: number;
    descuentos?: {
      hermanos?: number;
      pagoAnual?: number;
      primeraVez?: number;
    };
  };
  cupoMaximo: number;
  profesor?: string;
  horarios?: Horario[];
  configuracionPago?: {
    habilitarDescuentos: boolean;
    metodosPermitidos: string[];
  };
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
  nivel?: string;
  alumnosActuales?: number;
  creadoPor?: string;
  actualizadoPor?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;

  constructor() {
    this.nombre = '';
    this.descripcion = '';
    this.edadMinima = 3;
    this.edadMaxima = 18;
    this.tipo = 'RECREATIVO';
    this.estado = 'ACTIVA';
    this.precio = {
      cuotaMensual: 0,
      descuentos: {
        hermanos: 0,
        pagoAnual: 0,
        primeraVez: 0
      }
    };
    this.cupoMaximo = 1; // Sincronizado con backend (mínimo 1)
    this.horarios = [];
    this.configuracionPago = {
      habilitarDescuentos: true,
      metodosPermitidos: ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO']
    };
    this.nivel = 'PRINCIPIANTE';
    this.alumnosActuales = 0;
  }

  // Getters y setters de compatibilidad eliminados - usar solo nomenclatura nueva
}

export interface Horario {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  // Nuevos campos para compatibilidad
  horaInicio?: string;
  horaFin?: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
  descripcion: string;
  tipo: 'INFANTIL' | 'JUVENIL' | 'COMPETITIVO' | 'RECREATIVO' | 'ENTRENAMIENTO';
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
  horarios?: Horario[];
  configuracionPago?: {
    habilitarDescuentos: boolean;
    metodosPermitidos: string[];
  };
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
}

export interface UpdateCategoriaRequest {
  nombre?: string;
  descripcion?: string;
  tipo?: 'INFANTIL' | 'JUVENIL' | 'COMPETITIVO' | 'RECREATIVO' | 'ENTRENAMIENTO';
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
  horarios?: Horario[];
  configuracionPago?: {
    habilitarDescuentos: boolean;
    metodosPermitidos: string[];
  };
  equipamiento?: {
    incluido: string[];
    requerido: string[];
  };
}

export interface CategoriasResponse {
  categorias: Categoria[];
  total: number;
  filtrosAplicados?: any;
}

// Constantes actualizadas
export const TIPOS_CATEGORIA = ['INFANTIL', 'JUVENIL', 'COMPETITIVO', 'RECREATIVO', 'ENTRENAMIENTO'] as const;
export const ESTADOS_CATEGORIA = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'] as const;
export const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'] as const;
export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'] as const;
export const METODOS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO'] as const;

