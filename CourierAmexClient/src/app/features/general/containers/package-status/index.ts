import { PackageStatusDetailsContainer } from "./package-status-details/package-status-details.container";
import { PackageStatusListContainer } from "./package-status-list/package-status-list.container";

export const PACKAGESTATUS_CONTAINERS = [
  PackageStatusDetailsContainer,
  PackageStatusListContainer
];

export * from './package-status-details/package-status-details.container';
export * from './package-status-list/package-status-list.container';
