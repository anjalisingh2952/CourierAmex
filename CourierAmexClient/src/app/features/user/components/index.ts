import { PROFILE_COMPONENTS } from "./profile";
import { ROLES_COMPONENTS } from "./roles";
import { USERS_COMPONENTS } from "./users";

export const USER_COMPONENTS = [
  ...PROFILE_COMPONENTS,
  ...ROLES_COMPONENTS,
  ...USERS_COMPONENTS
];

export * from './profile';
export * from './roles';
export * from './users';
