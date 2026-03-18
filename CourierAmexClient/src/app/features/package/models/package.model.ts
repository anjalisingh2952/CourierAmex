import { BaseEntity } from "@app/models";

export interface PackageModel extends BaseEntity<number> {
  companyId: number;
  number?: number;
  customerCode: string;
  origin: string;
  trackingNumber: string;
  courierName: string;
  commodityId?: number;
  weight?: number;
  weightLbs?: number;
  width?: number;
  height?: number;
  long?: number;
  volumetricWeight?: number;
  manifestId: number;
  searchCustomer: boolean;
  hasInvoice: boolean;
  copies: number;
  customerName: string;
  description: string;
  price: number;
}

export interface packageDetailModel {
  number: number,
  manifestType: string,
  packageType: string,
  date: string,
  totalPackage: string
  sortedPackage: number,
  bags: number
}

export const newPackageModel = {
  id: 0,
  companyId: 0,
  number: undefined,
  customerCode: '',
  origin: '',
  trackingNumber: '',
  courierName: '',
  commodityId: 0,
  status: 2,
  manifestId: 0,
  searchCustomer: false,
  hasInvoice: false,
  copies: 1,
  customerName: '',
  description: '',
  price: 0
};

export interface PackageEventModel {
  companyName: string;
  number?: number;
  createdAt?: number;
  user: string;
  section: string;
  description: string;
}

export interface PackageCategoryModel {
  companyId: number;
  companyName: string;
  number?: number;
  customerCode: string;
  customerName: string;
  description: string;
  category: string;
  select: boolean;
}

export interface PackageItemDetail {
  companyId: number;
  companyName: string;
  number: number;
  customerCode: string;
  customerName: string;
  description: string;
  category: string;
  select: any;
  price: number;
  weight: number;
  origin: string;
  volumetricWeight: number;
  trackingNumber: string;
  id: number;
  status: number;
  isEdit?: boolean; // Added this field for edit tracking
}

export interface PackagePriceUpdate {
  packageNumber: number;
  price: number;
  description: string;
  isPermission: boolean;
  isDocument: boolean;
}

export interface PackageItemModel {
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

export const newPackageItemModel = {
  brandId: "", // ID_MARCA
  modelId: "", // ID_MODELO
  series: "", // SERIE
  description: "", // DESCRIPCION
  composition: "", // COMPOSICION
  quantity: 0, // CANTIDAD
  unitCost: 0, // COSTO_UNITARIO
  origin: "", // PROCEDENCIA
  source: "", // ORIGEN
  state: "",// ESTADO
  style: "", // ESTILO
  color: "", // COLOR
  size: "", // TALLA
  batch: "", // PARTIDA
  invoice: "",// FACTURA
};

export interface PackageAddItemModel {
  brandId: string; // ID_MARCA
  modelId: string; // ID_MODELO
  series?: string; // SERIE
  description: string; // DESCRIPCION
  composition?: string; // COMPOSICION
  quantity: number; // CANTIDAD
  unitCost: number; // COSTO_UNITARIO
  origin: string; // PROCEDENCIA
  state: string; // ESTADO
  style?: string; // ESTILO
  color?: string; // COLOR
  size?: string; // TALLA
  batch?: string; // PARTIDA
  invoice?: string; // FACTURA
}


export interface RegisterBagPackagingRequest {
  manifestId: number;
  bag: string;
  taxType: number;
  width: number;
  height: number;
  length: number;
  actualVolumeWeight: number;
  actualWeight: number;
  systemVolumeWeight: number;
  systemWeight: number;
  packages: number;
  packagingType: string;
  sequence: number;
  category: string;
  user: string;
}


export interface PackageSheet {
  areaCode: string;
  clientAddress: string;
  clientCode: string;
  clientFullName: string;
  manifestDate: string;
  manifestNumber: string;
  packageDescription: string;
  packageID: number;
  packageNumber: string;
  packageOrigin: string;
  packagePrice: number;
  packageType: string;
  packageWeight: number;
  selected: boolean;
  stopName: string;
  zoneCode: string;
  zoneName: string;
}
export interface CommodityPriceModel {
  id: number;
  description: string;
}


