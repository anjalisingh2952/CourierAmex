import { BaseEntity } from "@app/models";

export interface LocationModel extends BaseEntity<number> {
  companyId?: number;
  name: string;
  countryId?: number;
  phone?: string;

  companyName?: string;
  countryName?: string;
  isSelected: boolean;
}

export const newLocationModel = {
  id: 0,
  companyId: undefined,
  countryId: undefined,
  name: '',
  status: 2,
  isSelected: false
};
