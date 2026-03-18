import { BaseEntity } from "@app/models";

export interface CommodityModel extends BaseEntity<number> {
  companyId?: number;
  code: string;
  description: string;
  customsDuty?: number;
  customsGct?: number;
  customsFee?: number

  companyName?: string;
}

export const newCommodityModel = {
  id: 0,
  companyId: 0,
  code: '',
  description: '',
  status: 2
};
