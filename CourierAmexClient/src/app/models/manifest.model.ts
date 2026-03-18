import { BaseEntity } from "@app/models";

export interface ManifestModel extends BaseEntity<number> {
  companyId?: number;
  manifestNumber?: string;
  address?: string;
  manifestDate?: number;
  ready?: number;
  invoiced?: number;
  closed?: number;
  synchronized?: number;
  name?: string;
  type?: number;
  shipType: number;
  shippingWay?: number;
  invoiceStatus?: number;
  automaticBilling?: number;
  shippingWayName?: string;
  shippingWayId?:number;
}

export const newManifestModel: ManifestModel = {
  id: 0,
  companyId: undefined,
  name: 'N/A',
  shipType: 0,
  manifestDate: new Date().getTime(),
  shippingWay: undefined,
  closed: 0,
  status: 2,
  totalRows: 0,
  shippingWayName: ''
}

export interface ManifestScanner {
  manifestNumber: number;
  manifestDate: number;
  id: number;
  packages: number;
}

export interface CountManifestScanner {
  total: number;
  pending: number;
  normal: number;
  customs: number;
}

export const newCountManifestScanner: CountManifestScanner = {
  total: 0,
  pending: 0,
  normal: 0,
  customs: 0
}

export interface BagInfo {
  total: number;
  pending: number;
  normal: number;
  customs: number;
  bag: string;
}

export const newBagInfo: BagInfo = {
  total: 0,
  pending: 0,
  normal: 0,
  customs: 0,
  bag: ''
}

export interface PendingPackages {
  packageNumber: string;
  customerAccount: string;
  customerName: string;
  origin: string;
  description: string;
  bag: string;
}

export const newPendingPackages: PendingPackages = {
  packageNumber: "",
  customerAccount: "",
  customerName: "",
  origin: "",
  description: "",
  bag: ""
}

export interface ScanPackage {
  customer: string;
  name: string;
  description: string;
  weight: number;
  volume: number;
  zone: number;
  route: number;
}

export const newScanPackage: ScanPackage = {
  customer: "",
  name: "",
  description: "",
  weight: 0,
  volume: 0,
  zone: 0,
  route: 0
}

export class ScanLog {
  id: number;
  date: Date;
  user: string;
  logType: string;
  scanType: string;
  packageNumber: number;
  previousManifest: string;
  newManifest: string;
  previousBag: string;
  newBag: string;

  constructor(
    id: number = 0,
    date: Date = new Date(),
    user: string = '',
    logType: string = '',
    scanType: string = '',
    packageNumber: number = 0,
    previousManifest: string = '',
    newManifest: string = '',
    previousBag: string = '',
    newBag: string = ''
  ) {
    this.id = id;
    this.date = date;
    this.user = user;
    this.logType = logType;
    this.scanType = scanType;
    this.packageNumber = packageNumber;
    this.previousManifest = previousManifest;
    this.newManifest = newManifest;
    this.previousBag = previousBag;
    this.newBag = newBag;
  }
}


export interface ScannedPackageInfo {
  client: string;
  fullName: string;
  description: string;
  weight: number;
  volume: number;
  zone: string;
  route: number;
  manifestId: number;
  manifestNumber: string;
  manifestCountry: string;
  packageNumber: number;
  manifestDetailId: number;
  packageId: number;
  packageCountry: string;
  area: string;
  countryname: string;
  totalLabel: string;
  shipment: number;
  bag: string;
  estId: number;
  type:number;
  packageCompanyId: number
}

export const newScannedPackageInfo: ScannedPackageInfo = {
  client: '',
  fullName: '',
  description: '',
  weight: 0,
  volume: 0,
  zone: '',
  route: 0,
  manifestId: 0,
  manifestNumber: '',
  manifestCountry: '',
  packageNumber: 0,
  manifestDetailId: 0,
  packageId: 0,
  packageCountry: '',
  area: '',
  countryname: '',
  totalLabel: '',
  shipment: 0,
  bag: '',
  estId: 0,
  type:0,
  packageCompanyId: 0
}



export interface PackageReassign {
  packageNumber: number;
  manifestId: number;
  bagNumber: string;
  modifiedby: string;
}

export const newPackageReassign: PackageReassign = {
  packageNumber: 0,
  manifestId: 0,
  bagNumber: "",
  modifiedby: ""
}

export enum PackageStatus {
  Reassigned = 0,
  AlreadyManifested = 1,
  CountryMismatch = 3,
  GatewayMismatch = 4,
  Unknown = -1
}

export interface RouteInsertModel {
  description: string;
  userId: string;
  status: number;
  zoneId: number;
  deliveryTypeId: number;
  PointOfSaleId: number;
  companyId: string;
  packageIds: number[];
}
export interface AddManifestPackageResponse {
  response: number;
  responseMessage: string;
  }
  export interface AddManifestPackageRequest {
  manifestId: number;
  packageNumber: number;
  manifestNumber: string;
  createdBy: string;
  type: string;
  manifestStatusId: number;
  trackingNumber: string;
  trackingAddress: string;
  manifestShipmentType: number;
  gateway: string;
  }