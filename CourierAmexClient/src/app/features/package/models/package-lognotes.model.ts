// import { FetchBackend } from "@angular/common/http";
import { BaseEntity } from "@app/models";

export interface PackageLogNotesModel extends BaseEntity<number> {
    IdNota: number;
    // number?: number;
    Numero: number;
    Codigo: string;
    Courier?: string;
    Mensaje: string;
    IdUsuario: string;
    TipoBitacora: string;
    Fecha: Date;
    CustomerName?: string;
}

export const newPackageLogNotes = {
    IdNota:0,
    Numero:0,
    Codigo:'',
    Courier:'',
    Mensaje:'',
    IdUsuario:'',
    TipoBitacora:'',
    Fecha: new Date()
};


