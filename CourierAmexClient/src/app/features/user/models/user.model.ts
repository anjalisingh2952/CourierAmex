import { BaseEntity } from "@app/models";
import { RoleModel } from "./role.model";
import { DEFAULT_STATUS_ACTIVE, DEFAULT_USER_SESSION_TIMEOUT } from "@app/@shared";

export interface UserModel extends BaseEntity<string> {
  name: string;
  lastname: string;
  username: string;
  email: string;
  mobile: string;
  phone: string;
  office: string;
  countryId?: number;
  stateId?: number;
  addressLine1: string;
  addressLine2: string;
  dateOfBirth?: number;
  dateOfBirthValue?: string;
  city: string;
  zip: string;
  gender?: number;
  operationType: number;
  companyId?: number;
  sessionTimeout?: number;
  tempPassword?: string;
  
  roles: RoleModel[];
}

export const newUserModel = {
  id: '',
  name: '',
  lastname: '',
  username: '',
  email: '',
  mobile: '',
  phone: '',
  office: '',
  countryId: 0,
  stateId: 0,
  addressLine1: '',
  addressLine2: '',
  city: '',
  zip: '',
  gender: 0,
  companyId: undefined,
  dateOfBirth: undefined,
  status: DEFAULT_STATUS_ACTIVE,
  operationType: 0,
  sessionTimeout: DEFAULT_USER_SESSION_TIMEOUT,
  
  roles: []
}
