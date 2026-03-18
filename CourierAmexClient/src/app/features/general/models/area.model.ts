import { BaseEntity } from "@app/models";

export interface AreaModel extends BaseEntity<number> {
  zoneId?: number;
  code: string;
  name: string;
  notes?: string;
  
  zoneName?: string;
  countryId?: number;
  stateId?: number;
}

export const newAreaModel: AreaModel = {
  id: 0,
  countryId: undefined,
  stateId: undefined,
  zoneId: undefined,
  code: '',
  name: '',
  status: 2
}
