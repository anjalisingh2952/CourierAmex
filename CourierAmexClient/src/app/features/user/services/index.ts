import { RoleService } from "./role.service";
import { UserService } from "./user.service";

export const USER_SERVICES = [
  RoleService,
  UserService
];

export * from './role.service';
export * from './user.service';
