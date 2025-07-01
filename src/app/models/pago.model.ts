export interface Pago {
  _id?: string;
  usuario: string;
  categoriaEscuela: string;
  tipoPeriodo: 'mensual' | 'anual';
  monto: number;
  montoDescuento?: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado' | 'procesando';
  mercadopagoId?: string;
  preferenciaId?: string;
  fechaVencimiento?: Date;
  periodoInicio: Date;
  periodoFin: Date;
  metadatos?: any;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  fechaPago?: Date;
  detallesPago?: DetallePago;
  historialEstados?: HistorialEstado[];
}

export interface DetallePago {
  metodoPago?: string;
  tipoTarjeta?: string;
  ultimosDigitos?: string;
  cuotas?: number;
  transactionId?: string;
  paymentMethodId?: string;
  issuerId?: string;
}

export interface HistorialEstado {
  estado: string;
  fecha: Date;
  observaciones?: string;
}

export interface CreatePaymentPreferenceRequest {
  categoriaEscuelaId: string;
  tipoPeriodo: 'mensual' | 'anual';
  redirectUrls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}

export interface PaymentPreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}
