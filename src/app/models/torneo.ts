export class Torneo {
    _id!: string;
    nombre: string;
    descripcion: string;
    lugar: string;
    direccion: string;
    organizador!: string;
    fecha_inicio: Date | string;
    costo_inscripcion: number;
    activo: boolean;

    constructor() {
        this.nombre = "";
        this.descripcion = "";
        this.lugar = "";
        this.direccion = "";
        this.organizador = "";
        this.fecha_inicio = new Date();
        this.costo_inscripcion = 0;
        this.activo = true;
    }
}
