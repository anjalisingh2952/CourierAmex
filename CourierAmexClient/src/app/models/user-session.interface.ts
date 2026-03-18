import { CompanyModel } from "@app/features";
import { UserPermissionModel } from "./user-permission.interface";

export interface UserSessionModel {
  id: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  status: number;
  
  addressLine1?: string;
  addressLine2?: string;
  countryId?: number;
  stateId?: number;
  dateOfBirth?: number;
  companyId?: number;
  gender?: number;
  lastLoginDate?: number;
  operationType: number;
  sessionTimeout?: number;
  zip?: string;
  changePassword: boolean;

  company?: CompanyModel;
  permissions: UserPermissionModel[];
}
