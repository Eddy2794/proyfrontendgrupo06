import { HoraAuxiliar } from "./horario-auxiliar";

export class CategoriaAuxiliar {
  _id?: string;
  nombre: string;
  descripcion: string;
  nivel: string;
  edadMinima: number;
  edadMaxima: number;
  precio: {
    cuotaMensual: number;
  };
  cupoMaximo: number;
  estado: string;
  profesor?: string;

  constructor() {
    this.nombre = '';
    this.descripcion = '';
    this.nivel = '';
    this.edadMinima = 0;
    this.edadMaxima = 0;
    this.precio = {
      cuotaMensual: 0
    };
    this.cupoMaximo = 0;
    this.estado = 'ACTIVA';
  }
}
