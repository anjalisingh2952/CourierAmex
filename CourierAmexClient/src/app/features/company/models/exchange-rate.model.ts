import { BaseEntity } from "@app/models";

export interface ExchangeModel extends BaseEntity<number> {
  companyId?: number;
  companyName?: string;
  createdAt?: string;
  currencyCode: number;
  currency?: string;
  sale?: number;
  buy?:number;
  vatWithholding: number;  
  incomeWithholding: number;
  templateId: number;
  sourceCurrencyCode?: string,
  destinationCurrency?: string,
  saleRate?: number,
  purchaseRate?: number,
  date?:string 
}

export const newExchangeModel = {
  id: 0,
  createdAt: new Date().toISOString(),
  companyName: "New",
  currencyCode: 0,
  status: 1,
  companyId: undefined,
  sale:0,
  buy:0,
  vatWithholding: 0,
  incomeWithholding: 0,
  templateId: 0,
  sourceCurrencyCode:'',
  destinationCurrency:'',
  saleRate: 0,
  purchaseRate:0,
  date: new Date().toISOString()
};

export interface ExchangeListModel extends BaseEntity<number> {
  companyId?: number;
  name?: string;
  buyingRate?: number;
  sellingRate: number;
  exrDate?: string;
}
