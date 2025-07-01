import { HoraAuxiliar } from "./horario-auxiliar";

export class CategoriaAuxiliar {
    _id!: string;
    nombre: string;
    descripcion: string;
    nivel: string;
    edad_min: number;
    edad_max: number;
    cuota_mensual: number;
    max_alumnos: number;
    activa: boolean;
    horarios: HoraAuxiliar[];

    constructor() {
        this.nombre = "";
        this.descripcion = "";
        this.nivel = "";
        this.edad_min = 0;
        this.edad_max = 0;
        this.cuota_mensual = 0;
        this.max_alumnos = 0;
        this.activa = true;
        this.horarios = new Array<HoraAuxiliar>();
    }
}
