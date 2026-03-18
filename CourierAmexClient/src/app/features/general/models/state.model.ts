import { BaseEntity } from "@app/models";

export interface StateModel extends BaseEntity<number> {
  countryId?: number;
  name: string;

  countryName?: string;
}

export const newStateModel = {
  id: 0,
  name: '',
  status: 2
}
