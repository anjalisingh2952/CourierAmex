export interface ManifestProductsDetailHeader {
  fullName: number;
  manifestNumber: string;
  invoice: string;
  date: Date;
  freightVolume: number;
  exemptAmount: number;
  customsTax: number;
  salesTax: number;
  subTotal: number;
  discount: number;
  total: number;
  totalLocal: number;
  note: string;
}


export interface Manifestdetail {
  fullName: string;
  manifestNumber: string;
  invoiceNumber: number;
  date: Date;
  freightVolume: number;
  internationFreightFlet: number;
  handling: number;
  customsTaxes: number;
  vat: number;
  crManagement: number;
  packageEvisionPreviousExam: number;
  packageWithoutInvoice: number;
  nonUseAccountCharge: number;
  total: number;
}

export const newManifestdetail: Manifestdetail = {
  fullName: "",
  manifestNumber: "",
  invoiceNumber: 0,
  date: new Date(),
  freightVolume: 0,
  internationFreightFlet: 0,
  handling: 0,
  customsTaxes: 0,
  vat: 0,
  crManagement: 0,
  packageEvisionPreviousExam: 0,
  packageWithoutInvoice: 0,
  nonUseAccountCharge: 0,
  total: 0
};


export interface ManifestProvoider {
  supplierCOD: number;
  supplier: string;
  currency: string;
  amount: number;
}

export const newManifestReportDetailbySupplier: ManifestProvoider = {
  supplierCOD: 0,
  supplier: '',
  currency: '',
  amount: 0
}

export interface AverageManifest {
  manifestNumber: string;
  weight: number;
  volume: number;
  quantity: number;
  totalBilled: number;
  totalCost: number;
  freightCost: number;
  parafiscalContribution: number;
  customsTax: number;
  averageKg: number;
}

export const newManifestAveragePricebyKilogram: AverageManifest = {
  manifestNumber: '',
  weight: 0,
  volume: 0,
  quantity: 0,
  totalBilled: 0,
  totalCost: 0,
  freightCost: 0,
  parafiscalContribution: 0,
  customsTax: 0,
  averageKg: 0
}

export interface DetailedBilling {
  manifestdetails: Manifestdetail[];
  manifestSupplier: ManifestProvoider[];
  manifestAverage: AverageManifest[];

}

export const newDetailedBilling: DetailedBilling = {
  manifestAverage: [],
  manifestdetails: [],
  manifestSupplier: []
}

export interface ManifestProducts {
  id: number;
  description: string;
}


