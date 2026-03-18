import { BaseEntity } from "@app/models";

export interface CustomerPayTypeModel extends BaseEntity<number> {
  companyId?: number;
  name: string;
  companyName?: string;
}

export const newCustomerPayType = {
  id: 0,
  companyId: undefined,
  name: '',
  status: 2
};
