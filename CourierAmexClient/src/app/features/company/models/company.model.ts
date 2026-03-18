import { BaseEntity } from "@app/models";

export interface CompanyModel extends BaseEntity<number> {
  name: string;
  code: string;
  countryId?: number;
  currencyId?: number;
  address?: string;
  maxLevel?: number;
  fiscalMonth?: number;
  weightUnit: number;
  isCommodityRequired: boolean;
  countryName?: string;
  email?:string;
  phone?:string;
  attachmentUrl?:string;
}

export interface PackageItem {
  packagingDate: string;
  packageId: number;
  companyId: number;
  manifestId: number;
  manifestNumber: string | null;
  packageNumber: string;
  clientCode: string;
  fullName: string;
  company: string;
  origin: string;
  description: string;
  weight: number;
  volumetricWeight: number;
  taxRate: string;
  airGuide: string;
  category: string;
  airGuideCount: number;
}


export const newCompanyModel = {
  id: 0,
  name: '',
  code: '',
  status: 2,
  countryId: undefined,
  currencyId: undefined,
  weightUnit: 0,
  isCommodityRequired: false
};
