export interface UserPermissionModel {
  id: string;
  parent: string;
  name: string;
  view: boolean;
  add: boolean;
  update: boolean;
  delete: boolean;
}
