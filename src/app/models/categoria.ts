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
  
  // Campos virtuales para compatibilidad hacia atrás
  edad_min?: number;
  edad_max?: number;
  cuota_mensual?: number;
  activa?: boolean;
  max_alumnos?: number;
  alumnos_actuales?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
    this.cupoMaximo = 20;
    this.horarios = [];
    this.configuracionPago = {
      habilitarDescuentos: true,
      metodosPermitidos: ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO']
    };
    this.nivel = 'PRINCIPIANTE';
    this.alumnosActuales = 0;
  }

  // Getters para compatibilidad hacia atrás
  get edad_min(): number { return this.edadMinima; }
  get edad_max(): number { return this.edadMaxima; }
  get cuota_mensual(): number { return this.precio.cuotaMensual; }
  get activa(): boolean { return this.estado === 'ACTIVA'; }
  get max_alumnos(): number { return this.cupoMaximo; }
  get alumnos_actuales(): number { return this.alumnosActuales || 0; }
  get createdAt(): Date | undefined { return this.fechaCreacion; }
  get updatedAt(): Date | undefined { return this.fechaActualizacion; }

  // Setters para compatibilidad hacia atrás
  set edad_min(value: number) { this.edadMinima = value; }
  set edad_max(value: number) { this.edadMaxima = value; }
  set cuota_mensual(value: number) { this.precio.cuotaMensual = value; }
  set activa(value: boolean) { this.estado = value ? 'ACTIVA' : 'INACTIVA'; }
  set max_alumnos(value: number) { this.cupoMaximo = value; }
  set alumnos_actuales(value: number) { this.alumnosActuales = value; }
  set createdAt(value: Date | undefined) { this.fechaCreacion = value; }
  set updatedAt(value: Date | undefined) { this.fechaActualizacion = value; }
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

// Nota: Alias CategoriaEscuela eliminados en Fase 2 de migración - usar Categoria directamente
