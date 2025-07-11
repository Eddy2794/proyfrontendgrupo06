export interface Pago {
  _id?: string;
  usuario: string;
  categoria: string;
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
  categoriaId: string;
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
  sandboxInitPoint?: string;
  monto: number;
  categoria?: string;
  periodo?: string;
}

export interface QRPaymentResponse {
  preferenceId: string;
  pagoId: string;
  qrData?: string;
  initPoint: string;
  sandboxInitPoint?: string;
  monto: number;
  categoria: string;
  descripcion: string;
  expiresAt: Date;
  metodoPago: string;
}
