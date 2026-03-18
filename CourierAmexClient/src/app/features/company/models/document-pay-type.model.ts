import { BaseEntity } from "@app/models";

export interface DocumentPayTypeModel extends BaseEntity<number> {
  companyId?: number;
  companyName?: string;
  name: string;
  payTypeId: number;
  payType?: string;
  currencyCode: number;
  currency?: string;
  bankId: number;
  brandId?: number;
  bankComission: number;
  vatWithholding: number;  
  incomeWithholding: number;
  moduleId?: string;
  templateId: number;
}


export const newDocumentPayType = {
  id: 0,
  companyId: undefined,
  name: '',
  payTypeId: 0,
  currencyCode: 0,
  bankId: 0,
  bankComission: 0,
  vatWithholding: 0,
  incomeWithholding: 0,
  moduleId: '',
  templateId: 0,
  status: 2
};
