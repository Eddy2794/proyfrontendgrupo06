import { PersonaModel } from "./persona.model";

export class ProfesorModel {
    _id!: string;
    personaData!: PersonaModel;
    titulo!: string;
    experiencia_anios!: number;
    fecha_contratacion!: string;
    salario!: number;

    constructor(data: Partial<ProfesorModel> = {}) {
        this._id = data._id || '';
        this.personaData = data.personaData || new PersonaModel();
        this.titulo = data.titulo || "";
        this.experiencia_anios = data.experiencia_anios || 0;
        this.fecha_contratacion = data.fecha_contratacion || "";
        this.salario = data.salario || 0;
    }

    toJSON(): any {
        return {
            _id: this._id,
            personaData: this.personaData.toJSON(),
            titulo: this.titulo,
            experiencia_anios: this.experiencia_anios,
            fecha_contratacion: this.fecha_contratacion,
            salario: this.salario,
        }
    }

    static fromJSON(data: any): ProfesorModel {
        const profesor = new ProfesorModel();
        profesor._id = data._id;
        profesor.personaData = PersonaModel.fromJSON(data.persona);
        profesor.personaData.fechaNacimiento = data.persona.fechaNacimiento ? new Date(data.persona.fechaNacimiento).toISOString().split('T')[0] : '';
        profesor.titulo = data.titulo;
        profesor.experiencia_anios = data.experiencia_anios;
        profesor.fecha_contratacion = data.fecha_contratacion ? new Date(data.fecha_contratacion).toISOString().split('T')[0] : '';
        profesor.salario = data.salario;
        return profesor;
    }
}