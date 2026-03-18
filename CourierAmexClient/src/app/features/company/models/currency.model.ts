import { BaseEntity } from "@app/models";

export interface CurrencyModel extends BaseEntity<number> {
  companyId?: number;
  companyName?: string;
  name: string;
  buyingRate?: number;
  sellingRate?: number;
  eXRDate?: number;
}


export const newCurrency = {
  companyId:0,
  id: 0,
  name: '',
  status: 2,
  buyingRate: 0,
  sellingRate: 0,
  eXRDate: 0
};


