import { BaseEntity } from "@app/models";

export interface PackageItemModel extends BaseEntity<number> {
    number: number; // NUMERO
    brandId: string; // ID_MARCA
    modelId: string; // ID_MODELO
    series?: string; // SERIE
    characteristics: string; // CARACTERISTICAS
    description: string; // DESCRIPCION
    composition?: string; // COMPOSICION
    quantity: number; // CANTIDAD
    unitCost: number; // COSTO_UNITARIO
    origin: string; // PROCEDENCIA
    source: string; // ORIGEN
    state: string; // ESTADO
    style?: string; // ESTILO
    color?: string; // COLOR
    size?: string; // TALLA
    batch?: string; // PARTIDA
    invoice?: string; // FACTURA
    inclusionDate: Date; // FEC_INCLUSION
    inclusionUser: number; // USER_INCLUSION
    modificationDate?: Date; // FEC_MODIFICA
    modificationUser?: number; // USER_MODIFICA
    invoiceDate?: Date; // FECHA_FACTURA
    cost?: number; // COSTO
}

export let NewPackageItemModel : PackageItemModel = {
    id: 0, // Assuming BaseEntity<number> requires an ID
    number: 0, // Default number
    brandId: '', // Empty string for required fields
    modelId: '',
    series: undefined, // Optional field
    characteristics: '',
    description: '',
    composition: undefined,
    quantity: 1, // Default to 1
    unitCost: 0.0,
    origin: '',
    source: '',
    state: '', // Default state
    style: undefined,
    color: undefined,
    size: undefined,
    batch: undefined,
    invoice: undefined,
    inclusionDate: new Date(), // Set current date
    inclusionUser: 0,
    modificationDate: undefined,
    modificationUser: undefined,
    invoiceDate: undefined,
    cost: undefined,
    status: 0
};


export class PackageItem_PreviousReport {
    id!: number;
    fullName!: string;
    packageNumber!: number;
    bag!: string;
    packageDescription!: string;
    brand!: string;
    model!: string;
    serialNumber!: string;
    description!: string;
    composition!: string;
    quantity!: number;
    unitCost!: number;
    origin!: string;
    status!: string;
    style!: string;
    color!: string;
    size!: string;
    itemNumber!: string;
    invoice!: string;
    source!: string;
    totalPrice!: number;
    packagePrice!: number;
    characteristics!: string;
    invoiceDate!: Date | null;
    totalRows!: number;
  }
  
  export const newPackageItem_PreviousReport: PackageItem_PreviousReport = {
    id: 0,
    fullName: '',
    packageNumber: 0,
    bag: '',
    packageDescription: '',
    brand: '',
    model: '',
    serialNumber: '',
    description: '',
    composition: '',
    quantity: 0,
    unitCost: 0,
    origin: '',
    status: '',
    style: '',
    color: '',
    size: '',
    itemNumber: '',
    invoice: '',
    source: '',
    totalPrice: 0,
    packagePrice: 0,
    characteristics: '',
    invoiceDate: null,
    totalRows: 0,
  };

  
  