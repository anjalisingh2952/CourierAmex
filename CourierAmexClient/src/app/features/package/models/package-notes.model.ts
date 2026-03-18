import { BaseEntity } from "@app/models";

//Tabla: CLI_NOTA
export interface PackageNotesModel extends BaseEntity<number> { 
    codigo: string;
    courier: string;
    message: string;
    createdAt: Date;
    dueDate: Date;
    idUser: string;
    sincronized: boolean;
    companyName: string;
    compannia: string;
    nombreCompleto: string;
    companyId: number;
}

export const newPackageNotes = {
    id: 0,
    status: 0,
    codigo: '',
    courier: '',
    message: '',
    createdAt: new Date(),
    dueDate: new Date(),
    idUser: '',
    sincronized: false,
    companyName: '',
    compannia:'',
    nombreCompleto:'',
    companyId:0
};