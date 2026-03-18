import { BaseEntity } from "@app/models";

export interface AirGuideModel extends BaseEntity<number> {
    companyId?: number;
    mainGuideId: number;
    consecutive: number;
    type?: string;
    guide?: string;
    guideName?: string;
    consignee?: string;
    contact?: string;
    customerName?: string;
    documentTypeId?: string;
    documentId?: string;
    width?: number;
    height?: number;
    long?: number;
    volumetricWeightReal?: number;
    weightReal?: number;
    volumetricWeighSystem?: number;
    weightSystem?: number;
    packages: number;
}

export const newAirGuideModel = {
    id:0,
    consecutive: 0,
    mainGuideId:0,
    companyId: undefined,
    guide: 'N/A',
    guideName: '',
    packages:0,
    status: 2
};

export interface PackageListByInvoice {
    invoiceNumber: string;
    packageId: number;
    packageNumber: string;
    clientCode: string;
    courierCode: string;
    courierName: string;
    origin: string;
    observations: string;
    insurance: number;
    country: string;
    createdDate: string;
    modifiedDate: string;
    createdBy: string;
    modifiedBy: string;
    packages: number;
    statusId: number;
    description: string;
    weight: number;
    price: number;
    width: number;
    height: number;
    length: number;
    volumetricWeight: number;
    receivedBy: string;
    destinationId: number;
    packageType: string;
    cod: string;
    invoiced: number;
    pallets: number;
    bag: number;
    totalKilos: number;
    type: string;
    totalLabels: string;
    packagingDetails: string;
    retrievedByClient: number;
    taxType: number;
    courierType: string;
    subPackageType: string;
    fullName: string;
    id: number;
    status: number;
  }

