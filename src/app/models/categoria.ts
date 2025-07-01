export class Categoria {
  _id?: string;
  nombre: string;
  edad_min: number;
  edad_max: number;
  descripcion?: string;
  activa: boolean;
  cuota_mensual: number;
  horarios: Horario[];
  max_alumnos: number;
  nivel: string;
  alumnos_actuales: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor() {
    this.nombre = '';
    this.edad_min = 3;
    this.edad_max = 18;
    this.descripcion = '';
    this.activa = true;
    this.cuota_mensual = 0;
    this.horarios = [];
    this.max_alumnos = 20;
    this.nivel = 'PRINCIPIANTE';
    this.alumnos_actuales = 0;
  }
}

export interface Horario {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
