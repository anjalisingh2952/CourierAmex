export interface CompanyInvoiceHeader {
  companyId: number;
  user: string;
  customer: string;
  date: Date;
  taxAmount: number;
  exemptAmount: number;
  customsTax: number;
  salesTax: number;
  subTotal: number;
  discount: number;
  total: number;
  totalLocal: number;
  note: string;
}

export interface CompanyInvoiceDetail {
  companyId: number;
  invoiceNumber: number;
  productId: number;
  quantity: number;
  price: number;
  customsTax: number;
  salesTax: number;
  taxableAmount: number;
  exemptAmount: number;
  subTotal: number;
  discount: number;
  total: number;
}

export interface CustomerInfo {
  filter: number;
  customer: string;
  fullName: string;
  address: string;
  commission: string;
  delivery: string;
  paymentTypeId: number;
  areaId: number;
  area: string;
  zoneId: number;
  zone: string;
}

export const newCustomerInfo: CustomerInfo = {
  filter: 0,
  customer: '',
  fullName: '',
  address: '',
  commission: '',
  delivery: '',
  paymentTypeId: 0,
  areaId: 0,
  area: '',
  zoneId: 0,
  zone: ''
}

export interface AccountingDetail {
  companyId: number;                // ID_EMPRESA
  entryCode: string;               // COD_ASIENTO
  periodDate: Date;                // FEC_PERIODO
  entryLineNumber: number;        // NUM_LINEA_ASIENTO
  transactionAmount: number;      // MONTO_MOV
  accountNumber: string;          // NUM_CUENTA
  debitCreditIndicator: string;   // IND_DEBCRE
  exchangeRate: number;           // MON_TIPO_CAMBIO
  originalAmount: number;         // MONTO_ORIGINAL
  originalCurrency: string;       // MONEDA_ORIGINAL
  clientCode: string;             // COD_CLIENTE
  entryClosureCode: string;       // CIERRE_ASIENTO
}

export interface PackageInfo {
  filter: number;
  id: number;
  packageNumber: string;
  customer: string;
  courier: string;
  courierNumber: string;
  origin: string;
  observation: string;
  sure: string;
  country: string;
  fechaCreo: Date;
  modificationDate?: Date;
  creo: string;
  modifiedBy: string;
  packagesCount: number;
  manifestId: number;
  description: string;
  weight: number;
  price: number;
  broad: number;
  high: number;
  long: number;
  volumeWeight: number;
  recievedBy: string;
  des_Id: number;
  packageType: string;
  cod: string;
  invoiced: boolean;
  pallets: number;
  bag: number;
  totalWeight: number;
  guy: string;
  totalLabel: number;
  packagingDetails: string;
  customerLooker: string;
  taxType: string;
  courierType: string;
  packageSubType: string;
  manifestNumber: string;
}

export const newPackageInfo: PackageInfo = {
  filter: 0,
  id: 0,
  packageNumber: '',
  customer: '',
  courier: '',
  courierNumber: "",
  origin: "",
  observation: "",
  sure: "",
  country: "",
  fechaCreo: new Date(),
  creo: "",
  modifiedBy: "",
  packagesCount: 0,
  manifestId: 0,
  description: "",
  weight: 0,
  price: 0,
  broad: 0,
  high: 0,
  long: 0,
  volumeWeight: 0,
  recievedBy: "",
  des_Id: 0,
  packageType: "",
  cod: "",
  invoiced: false,
  pallets: 0,
  bag: 0,
  totalWeight: 0,
  guy: "",
  totalLabel: 0,
  packagingDetails: "",
  customerLooker: "",
  taxType: "",
  courierType: "",
  packageSubType: "",
  manifestNumber: ""
}

export interface CompanyInvoiceData {
  customerInfo: CustomerInfo[];
  packageInfo: PackageInfo[];
  packageSummary: PackageInvoiceSummary;
}

export interface PackageInvoiceSummary {
  total: number;
  pending: number;
  billed: number;
}

export const newCompanyInvoiceData: CompanyInvoiceData = {
  customerInfo: [],
  packageInfo: [],
  packageSummary: { total: 0, billed: 0, pending: 0 }
}

export interface GroupedInvoiceData {
  parent: CustomerInfo;
  child: PackageInfo[];
}

export interface InvoiceArticle {
  id: number;
  description: string;
  exempt: boolean;
  quantity: number;
  customsTax: number;
  fixedAmount: number;
  price: number;
  total: number;
  tax: number;
  discount: number;
   
  //---new fields custom tax, sales tax, exempt amount, taxable amount....

  exemptAmount: number;
  taxableAmount: number;
  customsTaxAmount: number;
  salesTaxAmount: number;
  subTotalAmount: number;
  totalAmount: number;
}

export interface ElectronicInvoiceInformation {
  fullName: string;
  documentNumber: string;
  documentType: number;
  email: string;
  documentTypeCode: string;
}

export const newElectronicInvoiceInformation: ElectronicInvoiceInformation = {
  fullName: '',
  documentNumber: '',
  documentType: 0,
  email: '',
  documentTypeCode: ''
};


export interface SaveElectronicInvoiceInformation {
  date: Date;
  invoiceNumber: number;
  companyId: number;
  paymentType: number;
  taxDetailLineCode: string;
  saleCondition: string;
}

export interface saveMiamiInvoice {
  companyId: number;
  packageNumber: number;
  user: string;
  referenceNumber: string;
  total: number;
}

export interface saveManifestInvoice {
  manifestId: number
}

export interface CompanyExchangeRate {
  companyId: number;
  company: string;
  saleExchangeRate: number;
}


