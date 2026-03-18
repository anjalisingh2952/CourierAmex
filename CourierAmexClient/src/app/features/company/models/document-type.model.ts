import { BaseEntity } from "@app/models";

export interface DocumentTypeModel extends BaseEntity<number> {
  companyId?: number;
  name: string;
  mask?: string;
  companyName?: string;
}

export const newDocumentType = {
  id: 0,
  companyId: undefined,
  name: '',
  status: 2
};
