import { BaseEntity } from "@app/models";

export interface CountryModel extends BaseEntity<number> {
  name: string;
  shortname?: string;
  code?: number;
  address?: string;
  notes?: string;
}

export const newCountryModel = {
  id: 0,
  name: '',
  status: 2 //DEFAULT_STATUS_ACTIVE
};
