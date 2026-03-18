import { BaseEntity } from "@app/models";
import { LocationModel } from "./location.model";

export interface SupplierModel extends BaseEntity<number> {
  name: string;
  companyId?: number;
  countryId?: number;
  address?: string;
  phone?: string;
  contact?: string;
  locations: LocationModel[];

  companyName?: string;
  countryName?: string;
}

export const newSupplierModel = {
  id: 0,
  companyId: undefined,
  countryId: undefined,
  name: '',
  status: 2,
  locations: []
};
