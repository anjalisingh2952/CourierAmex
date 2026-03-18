import { BaseEntity, UserPermissionModel } from "@app/models";

export interface RoleModel extends BaseEntity<string> {
  companyId: number;
  name: string;
  rolePermissions?: UserPermissionModel[];
  isSelected?: boolean;
  companyName?: string;
}
