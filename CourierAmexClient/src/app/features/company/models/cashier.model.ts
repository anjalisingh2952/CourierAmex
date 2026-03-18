import { BaseEntity } from "@app/models";

export interface CashierModel extends BaseEntity<number> {
  name: string;
  companyId?: number;
  companyName?: string;
  printerName?: string;
  createdAt?: string;
  portNumber?: number;
  ipAddress?: string;
}

export interface UserByPointOfSaleModel {
  companyId: number;
  pointOfSaleId: number;
  user: string;
  userNumber: string;
}


export const newCashierModel = {
  id: 0,
  name: '',
  printerName: '',
  portNumber : 0,
  ipAddress: '',
  createdAt: new Date().toISOString(),
  companyName: "New",
  status: 1,
  companyId: undefined
};
