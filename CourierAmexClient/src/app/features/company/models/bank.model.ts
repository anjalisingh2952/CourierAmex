import { BaseEntity } from "@app/models";

export interface BankModel extends BaseEntity<number> {
  companyId?: number;
  name: string;
  phone?: string;
  address?: string;
}

export const newBank = {
  companyId:0,
  id: 0,
  name: '',
  phone: '',
  address: ''
};


