import { PROFILE_CONTAINERS } from "./profile";
import { ROLE_CONTAINERS } from "./roles";
import { USERS_CONTAINERS } from "./users";

export const USER_CONTAINERS = [
  ...PROFILE_CONTAINERS,
  ...ROLE_CONTAINERS,
  ...USERS_CONTAINERS
];

export * from './profile';
export * from './roles';
export * from './users';
