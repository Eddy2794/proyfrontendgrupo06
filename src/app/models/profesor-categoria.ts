import { ProfesorModel } from "./profesor-model";
import { CategoriaAuxiliar } from "./categoria-auxiliar";

export class ProfesorCategoria {    
    _id!: string;
    profesor: ProfesorModel;    
    categoria: CategoriaAuxiliar;
    fecha_asignacion: Date;
    estado: string;
    observaciones: string;

    constructor(data: Partial<ProfesorCategoria> = {}) {
        this.profesor = new ProfesorModel() || data.profesor;
        this.categoria = new CategoriaAuxiliar() || data.categoria;
        this.fecha_asignacion = data.fecha_asignacion || new Date();
        this.estado = data.estado || 'ACTIVO';
        this.observaciones = data.observaciones || '';
    }

    toJSON(): any {
        return {
            _id: this._id,
            profesor: this.profesor,
            categoria: this.categoria,
            fecha_asignacion: this.fecha_asignacion,
            estado: this.estado,
            observaciones: this.observaciones
        };
    }

    static fromJSON(data: any): ProfesorCategoria {
        const profesorCategoria = new ProfesorCategoria();
        profesorCategoria._id = data._id;
        profesorCategoria.profesor = ProfesorModel.fromJSON(data.profesor) || data.profesor_id;
        profesorCategoria.categoria = this.mapearCategoria(data.categoria) || data.categoria_id;
        profesorCategoria.fecha_asignacion = data.fecha_asignacion;
        profesorCategoria.estado = data.estado;
        profesorCategoria.observaciones = data.observaciones;
        return profesorCategoria;
    }

    private static mapearCategoria(categoria: any) {
        const categoriaAuxiliar = new CategoriaAuxiliar();
        categoriaAuxiliar._id = categoria._id;
        categoriaAuxiliar.nombre = categoria.nombre;
        categoriaAuxiliar.descripcion = categoria.descripcion;
        categoriaAuxiliar.nivel = categoria.nivel;
        categoriaAuxiliar.edadMinima = categoria.edadMinima;
    categoriaAuxiliar.edadMaxima = categoria.edadMaxima;
        return categoriaAuxiliar;
    }
}
