import { Torneo } from "./torneo";
import { CategoriaAuxiliar } from "./categoria-auxiliar";

export class TorneoCategoria {
    _id!: string;
  torneo: Torneo;
  categoria: CategoriaAuxiliar;
  observaciones: string;
  activa: boolean;
  fecha_asignacion: Date;

  constructor() {
    this.torneo = new Torneo();
    this.categoria = new CategoriaAuxiliar();
    this.observaciones = "";
    this.activa = true;
    this.fecha_asignacion = new Date();
  }
}
