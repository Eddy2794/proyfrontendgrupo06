import { AlumnoCategoria, AlumnoCategoriaModel } from './alumno-categoria.model';

// Tipos constantes basados en el backend
export type EstadoCuota = 'PENDIENTE' | 'PAGA' | 'VENCIDA';

// Interfaz principal para Cuota
export interface Cuota {
  _id?: string;
  alumno_categoria_id: string | AlumnoCategoria; // ID o objeto completo de AlumnoCategoria
  mes: string;
  anio: number;
  monto: number;
  estado?: EstadoCuota;
  fecha_vencimiento: Date | string;
  fecha_pago?: Date | string;
  metodo_pago?: string;
  descuento?: number;
  recargo?: number;
  observaciones?: string;
  comprobante_numero?: string;
  usuario_cobro?: string; // ID del usuario que realizó el cobro
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Campos populados (cuando vienen del backend con populate)
  alumno_categoria_datos?: AlumnoCategoria;
  
  // Campo calculado (virtual del backend)
  total_a_pagar?: number;
}

// Clase para el modelo Cuota con validaciones y métodos auxiliares
export class CuotaModel implements Cuota {
  _id?: string;
  alumno_categoria_id: string | AlumnoCategoria;
  mes: string;
  anio: number;
  monto: number;
  estado?: EstadoCuota;
  fecha_vencimiento: Date | string;
  fecha_pago?: Date | string;
  metodo_pago?: string;
  descuento?: number;
  recargo?: number;
  observaciones?: string;
  comprobante_numero?: string;
  usuario_cobro?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  alumno_categoria_datos?: AlumnoCategoria;
  total_a_pagar?: number;

  constructor(data: Partial<Cuota> = {}) {
    this._id = data._id;
    this.alumno_categoria_id = data.alumno_categoria_id || '';
    this.mes = data.mes || '';
    this.anio = data.anio || new Date().getFullYear();
    this.monto = data.monto || 0;
    this.estado = data.estado || 'PENDIENTE';
    this.fecha_vencimiento = data.fecha_vencimiento || new Date();
    this.fecha_pago = data.fecha_pago;
    this.metodo_pago = data.metodo_pago;
    this.descuento = data.descuento || 0;
    this.recargo = data.recargo || 0;
    this.observaciones = data.observaciones;
    this.comprobante_numero = data.comprobante_numero;
    this.usuario_cobro = data.usuario_cobro;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.alumno_categoria_datos = data.alumno_categoria_datos;
    this.total_a_pagar = data.total_a_pagar;
  }

  // Método para obtener el ID de la relación alumno-categoría
  get alumnoCategoriaId(): string {
    return typeof this.alumno_categoria_id === 'string' ? this.alumno_categoria_id : this.alumno_categoria_id._id || '';
  }

  // Método para obtener el nombre del alumno
  get nombreAlumno(): string {
    if (this.alumno_categoria_datos) {
      if ('nombreAlumno' in this.alumno_categoria_datos) {
        return (this.alumno_categoria_datos as any).nombreAlumno;
      }
    }
    return 'Alumno no identificado';
  }

  // Método para obtener el nombre de la categoría
  get nombreCategoria(): string {
    if (this.alumno_categoria_datos) {
      if ('nombreCategoria' in this.alumno_categoria_datos) {
        return (this.alumno_categoria_datos as any).nombreCategoria;
      }
    }
    return 'Categoría no identificada';
  }

  // Método para obtener el período como string
  get periodo(): string {
    return `${this.mes} ${this.anio}`;
  }

  // Método para calcular el total a pagar
  get totalAPagar(): number {
    if (this.total_a_pagar !== undefined) {
      return this.total_a_pagar;
    }
    return (this.monto - (this.descuento || 0) + (this.recargo || 0));
  }

  // Método para obtener la fecha de vencimiento formateada
  get fechaVencimientoFormateada(): string {
    if (!this.fecha_vencimiento) return '';
    const fecha = new Date(this.fecha_vencimiento);
    return fecha.toLocaleDateString('es-ES');
  }

  // Método para obtener la fecha de pago formateada
  get fechaPagoFormateada(): string {
    if (!this.fecha_pago) return '';
    const fecha = new Date(this.fecha_pago);
    return fecha.toLocaleDateString('es-ES');
  }

  // Método para verificar si está pagada
  get estaPagada(): boolean {
    return this.estado === 'PAGA';
  }

  // Método para verificar si está vencida
  get estaVencida(): boolean {
    if (this.estado === 'VENCIDA') return true;
    if (!this.fecha_vencimiento) return false;
    const hoy = new Date();
    const vencimiento = new Date(this.fecha_vencimiento);
    return hoy > vencimiento && this.estado !== 'PAGA';
  }

  // Método para obtener el estado como texto
  get estadoTexto(): string {
    switch (this.estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'PAGA': return 'Pagada';
      case 'VENCIDA': return 'Vencida';
      default: return 'Desconocido';
    }
  }

  // Método para obtener el monto formateado como moneda
  get montoFormateado(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(this.monto);
  }

  // Método para obtener el total formateado como moneda
  get totalFormateado(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(this.totalAPagar);
  }

  // Método para convertir a objeto plano para envío al backend
  toJSON(): any {
    return {
      _id: this._id,
      alumno_categoria_id: this.alumnoCategoriaId,
      mes: this.mes,
      anio: this.anio,
      monto: this.monto,
      estado: this.estado,
      fecha_vencimiento: this.fecha_vencimiento,
      fecha_pago: this.fecha_pago,
      metodo_pago: this.metodo_pago,
      descuento: this.descuento,
      recargo: this.recargo,
      observaciones: this.observaciones,
      comprobante_numero: this.comprobante_numero,
      usuario_cobro: this.usuario_cobro,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método estático para crear desde datos del backend
  static fromJSON(data: any): CuotaModel {
    return new CuotaModel(data);
  }
}

// Constantes para usar en formularios y validaciones
export const ESTADOS_CUOTA: { value: EstadoCuota; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGA', label: 'Pagada' },
  { value: 'VENCIDA', label: 'Vencida' }
];

export const MESES: { value: string; label: string }[] = [
  { value: 'ENERO', label: 'Enero' },
  { value: 'FEBRERO', label: 'Febrero' },
  { value: 'MARZO', label: 'Marzo' },
  { value: 'ABRIL', label: 'Abril' },
  { value: 'MAYO', label: 'Mayo' },
  { value: 'JUNIO', label: 'Junio' },
  { value: 'JULIO', label: 'Julio' },
  { value: 'AGOSTO', label: 'Agosto' },
  { value: 'SEPTIEMBRE', label: 'Septiembre' },
  { value: 'OCTUBRE', label: 'Octubre' },
  { value: 'NOVIEMBRE', label: 'Noviembre' },
  { value: 'DICIEMBRE', label: 'Diciembre' }
]; 