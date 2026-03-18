import { BaseEntity } from "@app/models";

export interface ZoneModel extends BaseEntity<number> {
  countryId?: number;
  stateId?: number;
  code: string;
  name: string;
  notes?: string;
  route?: number;

  countryName?: string;
  stateName?: string;
}

export const newZoneModel: ZoneModel = {
  id: 0,
  countryId: undefined,
  stateId: undefined,
  code: '',
  name: '',
  status: 2
}
